const { Commande, CommandeProduit, Produit } = require('../models');

const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_WEEKS = 16;
const EWMA_ALPHA = 0.38;

function weekIndex(ts) {
  return Math.floor(ts / MS_WEEK);
}

function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 };
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i += 1) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumXX += xs[i] * xs[i];
  }
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-9) {
    const mean = sumY / n;
    return { slope: 0, intercept: mean, r2: 0 };
  }
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i += 1) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot < 1e-9 ? 0 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));
  return { slope, intercept, r2 };
}

function ewmaLast(series, alpha) {
  if (!series.length) return 0;
  let v = series[0];
  for (let i = 1; i < series.length; i += 1) {
    v = alpha * series[i] + (1 - alpha) * v;
  }
  return v;
}

function momentumScore(series) {
  if (series.length < 8) return 0;
  const last4 = series.slice(-4).reduce((a, b) => a + b, 0);
  const prev4 = series.slice(-8, -4).reduce((a, b) => a + b, 0);
  return (last4 - prev4) / 4;
}

function confidenceLabel({ totalUnits, r2, weeksWithData }) {
  if (totalUnits >= 30 && r2 >= 0.25 && weeksWithData >= 6) return 'elevee';
  if (totalUnits >= 10 && weeksWithData >= 4) return 'moyenne';
  return 'faible';
}

/**
 * Prévision hebdomadaire par produit pour un vendeur :
 * — série des ventes (commandes payées / expédiées / livrées) par semaine
 * — tendance (régression linéaire) + lissage EWMA + momentum récent
 * — score = combinaison pondérée (projection semaine suivante + niveau lissé)
 */
async function predictTopProductsForVendeur(idVendeur, options = {}) {
  const numWeeks = Math.min(52, Math.max(8, Number(options.weeks) || DEFAULT_WEEKS));
  const now = Date.now();
  const currentWeekIdx = weekIndex(now);
  const lookbackStart = new Date(now - numWeeks * MS_WEEK);

  const vendorProducts = await Produit.find({ idVendeur })
    .select('idProd nomProd prix idCategorie')
    .lean();

  const productIds = new Set(vendorProducts.map((p) => p.idProd));
  if (productIds.size === 0) {
    return {
      predictions: [],
      meta: {
        modele: 'EWMA + regression lineaire + momentum (hebdomadaire)',
        semaines: numWeeks,
        genereLe: new Date().toISOString(),
        message: 'Aucun produit publie pour ce compte.'
      }
    };
  }

  const orders = await Commande.find({
    statut: { $in: ['payee', 'expediee', 'livree'] },
    date: { $gte: lookbackStart }
  })
    .select('idCommande date')
    .lean();

  const commandIds = orders.map((o) => o.idCommande);
  const dateByCmd = new Map(orders.map((o) => [o.idCommande, o.date ? new Date(o.date).getTime() : now]));

  const lines =
    commandIds.length === 0
      ? []
      : await CommandeProduit.find({
          idCommande: { $in: commandIds },
          idProd: { $in: [...productIds] }
        })
          .select('idCommande idProd qte')
          .lean();

  const byProduct = new Map();
  for (const pr of vendorProducts) {
    byProduct.set(pr.idProd, new Array(numWeeks).fill(0));
  }

  for (const line of lines) {
    const t = dateByCmd.get(line.idCommande);
    if (t == null) continue;
    const wi = weekIndex(t);
    const rel = currentWeekIdx - wi;
    if (rel < 0 || rel >= numWeeks) continue;
    const idx = numWeeks - 1 - rel;
    const arr = byProduct.get(line.idProd);
    if (!arr) continue;
    const q = Number(line.qte) || 0;
    arr[idx] += q;
  }

  const xs = Array.from({ length: numWeeks }, (_, i) => i);

  const rows = vendorProducts.map((prod) => {
    const series = byProduct.get(prod.idProd) || new Array(numWeeks).fill(0);
    const totalUnits = series.reduce((a, b) => a + b, 0);
    const weeksWithData = series.filter((v) => v > 0).length;

    const { slope, intercept, r2 } = linearRegression(xs, series);
    const xNext = numWeeks;
    const rawForecast = slope * xNext + intercept;
    const forecastLin = Math.max(0, rawForecast);

    const ewma = ewmaLast(series, EWMA_ALPHA);
    const mom = momentumScore(series);
    const momNorm = Math.max(-2, Math.min(2, mom / 2));

    const score = forecastLin * 0.42 + ewma * 0.43 + Math.max(0, momNorm + 1) * 0.15 * ewma;

    const conf = confidenceLabel({ totalUnits, r2, weeksWithData });

    return {
      idProd: prod.idProd,
      nomProd: prod.nomProd,
      prix: prod.prix,
      idCategorie: prod.idCategorie,
      serieHebdo: series,
      totalUnitesPeriode: totalUnits,
      previsionSemaineProchaine: Number(forecastLin.toFixed(2)),
      ewmaNiveau: Number(ewma.toFixed(2)),
      penteTendance: Number(slope.toFixed(4)),
      r2Ajustement: Number(r2.toFixed(3)),
      scoreComposite: Number(score.toFixed(3)),
      confiance: conf,
      semainesAvecVente: weeksWithData
    };
  });

  rows.sort((a, b) => b.scoreComposite - a.scoreComposite);

  const ranked = rows.map((r, i) => ({
    ...r,
    rang: i + 1
  }));

  return {
    predictions: ranked,
    meta: {
      modele: 'Combinaison EWMA (38%), regression lineaire sur l’historique hebdomadaire, et momentum 4 vs 4 semaines',
      semainesHistorique: numWeeks,
      statutsCommandes: ['payee', 'expediee', 'livree'],
      genereLe: new Date().toISOString(),
      avertissement:
        'Projection indicative basee sur l’historique des ventes. Les stocks, promotions et saisonnalite reels ne sont pas modelises.'
    }
  };
}

module.exports = {
  predictTopProductsForVendeur
};
