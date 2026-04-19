const {
  Commande,
  CommandeProduit,
  Produit,
  Paiement,
  Utilisateur,
  nextId
} = require('../models');
const AppError = require('../middleware/AppError');
const notificationService = require('./notificationService');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LIVRAISON_KEYS = [
  'livraisonNom',
  'livraisonPrenom',
  'livraisonTel',
  'livraisonAdresse',
  'livraisonVille',
  'livraisonCodePostal',
  'livraisonNotes'
];

function pickLivraison(data) {
  const out = {};
  for (const k of LIVRAISON_KEYS) {
    if (data[k] !== undefined && data[k] !== null) {
      const s = String(data[k]).trim();
      if (s !== '') out[k] = s;
    }
  }
  return out;
}

async function serializeCommande(cmdRaw) {
  const raw = cmdRaw.toObject ? cmdRaw.toObject() : { ...cmdRaw };
  const u = await Utilisateur.findOne({ idUtilisateur: raw.idClient })
    .select('idUtilisateur nom email')
    .lean();
  const lines = await CommandeProduit.find({ idCommande: raw.idCommande }).lean();
  const Produits = [];
  for (const line of lines) {
    const p = await Produit.findOne({ idProd: line.idProd }).lean();
    if (!p) continue;
    Produits.push({
      ...p,
      CommandeProduit: { qte: line.qte, prix: line.prix }
    });
  }
  const paiement = await Paiement.findOne({ idCommande: raw.idCommande }).lean();

  return {
    ...raw,
    Client: {
      idClient: raw.idClient,
      Utilisateur: u
        ? { idUtilisateur: u.idUtilisateur, nom: u.nom, email: u.email }
        : null
    },
    Produits,
    Paiement: paiement || null
  };
}

const CommandeService = {
  async createCommande(data) {
    const { idClient, statut, total, date } = data;
    if (idClient == null) {
      throw new AppError('idClient est requis', 400);
    }

    const idCommande = await nextId('commande');
    const commandeData = {
      idCommande,
      idClient,
      statut: statut ? String(statut).trim() : 'en_attente',
      ...pickLivraison(data)
    };

    if (total !== undefined) {
      const parsedTotal = Number(total);
      if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
        throw new AppError('Total invalide', 400);
      }
      commandeData.total = parsedTotal;
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('Date invalide', 400);
      }
      commandeData.date = parsedDate;
    }

    const commande = await Commande.create(commandeData);
    if (commande.statut === 'payee') {
      void notificationService.notifyOrderPaid(commande.idCommande).catch(() => {});
    }
    return serializeCommande(commande);
  },

  async getCommandes(filters = {}) {
    const { page = 1, limit = 10, search, idClient, statut, minTotal, maxTotal } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idClient != null) {
      filter.idClient = idClient;
    }
    if (statut) {
      filter.statut = statut;
    }
    if (search) {
      filter.statut = { $regex: escapeRegex(search), $options: 'i' };
    }
    if (minTotal != null) {
      filter.total = { ...filter.total, $gte: parseFloat(minTotal) };
    }
    if (maxTotal != null) {
      filter.total = { ...filter.total, $lte: parseFloat(maxTotal) };
    }

    const total = await Commande.countDocuments(filter);
    const rows = await Commande.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ date: -1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeCommande(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getCommandeById(id) {
    const commande = await Commande.findOne({ idCommande: id });

    if (!commande) {
      throw new AppError('Commande non trouvée', 404);
    }

    return serializeCommande(commande);
  },

  async updateCommande(id, data) {
    const commande = await Commande.findOne({ idCommande: id });
    if (!commande) {
      throw new AppError('Commande non trouvée', 404);
    }

    const prevStatut = commande.statut;

    if (data.statut !== undefined) {
      commande.statut = String(data.statut).trim();
    }

    if (data.total !== undefined) {
      const parsedTotal = Number(data.total);
      if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
        throw new AppError('Total invalide', 400);
      }
      commande.total = parsedTotal;
    }

    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('Date invalide', 400);
      }
      commande.date = parsedDate;
    }

    if (data.idClient !== undefined) {
      commande.idClient = data.idClient;
    }

    const liv = pickLivraison(data);
    for (const [k, v] of Object.entries(liv)) {
      commande[k] = v;
    }

    await commande.save();

    if (commande.statut === 'payee' && prevStatut !== 'payee') {
      void notificationService.notifyOrderPaid(id).catch(() => {});
    }

    return serializeCommande(commande);
  },

  async deleteCommande(id) {
    const commande = await Commande.findOne({ idCommande: id });
    if (!commande) {
      throw new AppError('Commande non trouvée', 404);
    }

    await CommandeProduit.deleteMany({ idCommande: id });
    await Paiement.deleteMany({ idCommande: id });
    await Commande.deleteOne({ idCommande: id });
    return { message: 'Commande supprimée avec succès' };
  }
};

module.exports = CommandeService;
