import { BarChart3, ExternalLink, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchVendeurPredictionsVentes } from '../api'
import { formatMoneyDA } from '../utils/format'

function Sparkline({ values }) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex h-10 w-full max-w-[120px] items-end gap-px" title="Ventes par semaine (plus récent à droite)">
      {values.map((v, i) => (
        <div
          key={i}
          className="min-h-[2px] flex-1 rounded-sm bg-[#00d154]/70"
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function ConfianceBadge({ niveau }) {
  const map = {
    elevee: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    moyenne: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    faible: 'bg-slate-600/30 text-slate-400 border-white/10',
  }
  const label = { elevee: 'Élevée', moyenne: 'Moyenne', faible: 'Faible' }[niveau] || niveau
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[niveau] || map.faible}`}>
      {label}
    </span>
  )
}

export function SellerPredictionsPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchVendeurPredictionsVentes({ semaines: 16 })
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-slate-400">Analyse des ventes en cours…</p>
  if (err) return <p className="text-red-400">{err}</p>

  const preds = data?.predictions ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <BarChart3 className="h-7 w-7 text-[#00d154]" />
            Prévision des ventes
          </h1>
          <p className="mt-1 max-w-2xl text-slate-400">
            Classement des produits les plus susceptibles de se vendre dans les prochaines semaines, à partir de
            l’historique des commandes validées.
          </p>
        </div>
      </div>

      {meta ? (
        <div className="mt-8 rounded-xl border border-[#3b82f6]/25 bg-[#3b82f6]/10 p-4">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#93c5fd]" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-white">Modèle</p>
              <p className="mt-1 text-slate-400">{meta.modele}</p>
              <p className="mt-2 text-xs text-slate-500">
                Historique : {meta.semainesHistorique} semaines · Généré le{' '}
                {new Date(meta.genereLe).toLocaleString('fr-FR')}
              </p>
              {meta.avertissement ? <p className="mt-2 text-xs text-slate-500">{meta.avertissement}</p> : null}
              {meta.message ? <p className="mt-2 text-sm text-amber-200/90">{meta.message}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {preds.length === 0 ? (
        <p className="mt-10 text-slate-500">Aucune donnée à afficher.</p>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-[#111827] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Rang</th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Tendance</th>
                <th className="px-4 py-3 font-medium">Unités (période)</th>
                <th className="px-4 py-3 font-medium">Prév. sem. proch.</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {preds.map((row) => (
                <tr key={row.idProd} className="border-t border-white/5 bg-[#0c1220]">
                  <td className="px-4 py-3 font-semibold text-[#00d154]">#{row.rang}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{row.nomProd}</p>
                    <p className="text-xs text-slate-500">{formatMoneyDA(row.prix)}</p>
                    <Link
                      to={`/produit/${row.idProd}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:underline"
                    >
                      Voir la fiche <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Sparkline values={row.serieHebdo} />
                    <p className="mt-1 text-[10px] text-slate-600">R² {row.r2Ajustement}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.totalUnitesPeriode}</td>
                  <td className="px-4 py-3 text-white">{row.previsionSemaineProchaine}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.scoreComposite}</td>
                  <td className="px-4 py-3">
                    <ConfianceBadge niveau={row.confiance} />
                    <p className="mt-1 text-[10px] text-slate-600">{row.semainesAvecVente} sem. avec vente</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preds.length > 0 ? (
        <div className="mt-8 grid gap-4 text-sm text-slate-500 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-[#111827] p-4">
            <p className="font-medium text-slate-300">Prévision semaine prochaine</p>
            <p className="mt-2 leading-relaxed">
              Unités estimées d’après la tendance linéaire (régression sur les semaines), plafonnée à 0 si la tendance
              est négative.
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-[#111827] p-4">
            <p className="font-medium text-slate-300">Score composite</p>
            <p className="mt-2 leading-relaxed">
              Mélange de la projection, du niveau lissé (EWMA) et du momentum récent pour classer les articles, même
              si la tendance brute est bruyante.
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-[#111827] p-4">
            <p className="font-medium text-slate-300">Confiance</p>
            <p className="mt-2 leading-relaxed">
              Indique la fiabilité relative : plus il y a d’historique de ventes et plus l’ajustement linéaire colle aux
              données, plus la confiance est élevée.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
