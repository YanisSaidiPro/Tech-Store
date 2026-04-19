const { Paiement, Commande, nextId } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function serializePaiement(p) {
  const raw = p.toObject ? p.toObject() : { ...p };
  const cmd = await Commande.findOne({ idCommande: raw.idCommande })
    .select('idCommande date statut total')
    .lean();
  return { ...raw, Commande: cmd };
}

const PaiementService = {
  async createPaiement(data) {
    const { idCommande, statut, date, somme, methode } = data;

    if (idCommande == null) {
      throw new AppError('idCommande est requis', 400);
    }

    const idPaiement = await nextId('paiement');
    const paiementData = {
      idPaiement,
      idCommande,
      statut: statut ? String(statut).trim() : 'en_attente'
    };

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('Date invalide', 400);
      }
      paiementData.date = parsedDate;
    }

    if (somme !== undefined) {
      const parsedSomme = Number(somme);
      if (Number.isNaN(parsedSomme) || parsedSomme < 0) {
        throw new AppError('Somme invalide', 400);
      }
      paiementData.somme = parsedSomme;
    }

    if (methode !== undefined) {
      paiementData.methode = String(methode).trim();
    }

    const paiement = await Paiement.create(paiementData);
    return serializePaiement(paiement);
  },

  async getPaiements(filters = {}) {
    const { page = 1, limit = 10, search, idCommande, idCommandesIn, statut, minSomme, maxSomme } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idCommandesIn && Array.isArray(idCommandesIn) && idCommandesIn.length > 0) {
      filter.idCommande = { $in: idCommandesIn };
    } else if (idCommande != null) {
      filter.idCommande = idCommande;
    }
    if (statut) {
      filter.statut = statut;
    }
    if (search) {
      filter.methode = { $regex: escapeRegex(search), $options: 'i' };
    }
    if (minSomme != null) {
      filter.somme = { ...filter.somme, $gte: parseFloat(minSomme) };
    }
    if (maxSomme != null) {
      filter.somme = { ...filter.somme, $lte: parseFloat(maxSomme) };
    }

    const total = await Paiement.countDocuments(filter);
    const rows = await Paiement.find(filter).skip(offset).limit(limitNumber).sort({ date: -1 }).lean();

    const data = await Promise.all(rows.map((r) => serializePaiement(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getPaiementById(id) {
    const paiement = await Paiement.findOne({ idPaiement: id });

    if (!paiement) {
      throw new AppError('Paiement non trouvé', 404);
    }

    return serializePaiement(paiement);
  },

  async updatePaiement(id, data) {
    const paiement = await Paiement.findOne({ idPaiement: id });
    if (!paiement) {
      throw new AppError('Paiement non trouvé', 404);
    }

    if (data.statut !== undefined) {
      paiement.statut = String(data.statut).trim();
    }
    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('Date invalide', 400);
      }
      paiement.date = parsedDate;
    }
    if (data.somme !== undefined) {
      const parsedSomme = Number(data.somme);
      if (Number.isNaN(parsedSomme) || parsedSomme < 0) {
        throw new AppError('Somme invalide', 400);
      }
      paiement.somme = parsedSomme;
    }
    if (data.methode !== undefined) {
      paiement.methode = String(data.methode).trim();
    }
    if (data.idCommande !== undefined) {
      paiement.idCommande = data.idCommande;
    }

    await paiement.save();
    return serializePaiement(paiement);
  },

  async deletePaiement(id) {
    const paiement = await Paiement.findOne({ idPaiement: id });
    if (!paiement) {
      throw new AppError('Paiement non trouvé', 404);
    }

    await Paiement.deleteOne({ idPaiement: id });
    return { message: 'Paiement supprimé avec succès' };
  }
};

module.exports = PaiementService;
