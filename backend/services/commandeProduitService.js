const { CommandeProduit, Commande, Produit } = require('../models');
const AppError = require('../middleware/AppError');

async function serializeLine(line) {
  const raw = line.toObject ? line.toObject() : { ...line };
  const cmd = await Commande.findOne({ idCommande: raw.idCommande })
    .select('idCommande date statut total')
    .lean();
  const produit = await Produit.findOne({ idProd: raw.idProd }).select('idProd nomProd prix').lean();
  return {
    ...raw,
    Commande: cmd,
    Produit: produit
  };
}

const CommandeProduitService = {
  async createCommandeProduit(data) {
    const { idCommande, idProd, qte, prix } = data;
    const quantity = qte != null ? Number(qte) : null;
    const unitPrice = prix != null ? Number(prix) : null;

    if (idCommande == null || idProd == null) {
      throw new AppError('idCommande et idProd sont requis', 400);
    }

    if (quantity == null || Number.isNaN(quantity) || quantity <= 0) {
      throw new AppError('La quantité doit être un nombre strictement positif', 400);
    }

    if (unitPrice == null || Number.isNaN(unitPrice) || unitPrice < 0) {
      throw new AppError('Le prix doit être un nombre positif ou nul', 400);
    }

    const existing = await CommandeProduit.findOne({ idCommande, idProd });
    if (existing) {
      existing.qte += quantity;
      existing.prix = unitPrice;
      await existing.save();
      return existing.toObject();
    }

    const commandeProduit = await CommandeProduit.create({
      idCommande,
      idProd,
      qte: quantity,
      prix: unitPrice
    });

    return commandeProduit.toObject();
  },

  async getCommandeProduits(filters = {}) {
    const { page = 1, limit = 10, search, idCommande, idProd, minPrix, maxPrix } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idCommande != null) {
      filter.idCommande = idCommande;
    }
    if (idProd != null) {
      filter.idProd = idProd;
    }
    if (minPrix != null) {
      filter.prix = { ...filter.prix, $gte: parseFloat(minPrix) };
    }
    if (maxPrix != null) {
      filter.prix = { ...filter.prix, $lte: parseFloat(maxPrix) };
    }

    const total = await CommandeProduit.countDocuments(filter);
    const rows = await CommandeProduit.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ idCommande: 1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeLine(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getCommandeProduit(idCommande, idProd) {
    if (idCommande == null || idProd == null) {
      throw new AppError('idCommande et idProd sont requis', 400);
    }

    const commandeProduit = await CommandeProduit.findOne({ idCommande, idProd }).lean();

    if (!commandeProduit) {
      throw new AppError('CommandeProduit non trouvé', 404);
    }

    return serializeLine(commandeProduit);
  },

  async updateCommandeProduit(idCommande, idProd, data) {
    const commandeProduit = await CommandeProduit.findOne({ idCommande, idProd });
    if (!commandeProduit) {
      throw new AppError('CommandeProduit non trouvé', 404);
    }

    if (data.qte !== undefined) {
      const quantity = Number(data.qte);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new AppError('La quantité doit être un nombre strictement positif', 400);
      }
      commandeProduit.qte = quantity;
    }

    if (data.prix !== undefined) {
      const unitPrice = Number(data.prix);
      if (Number.isNaN(unitPrice) || unitPrice < 0) {
        throw new AppError('Le prix doit être un nombre positif ou nul', 400);
      }
      commandeProduit.prix = unitPrice;
    }

    await commandeProduit.save();
    return commandeProduit.toObject();
  },

  async deleteCommandeProduit(idCommande, idProd) {
    const commandeProduit = await CommandeProduit.findOne({ idCommande, idProd });
    if (!commandeProduit) {
      throw new AppError('CommandeProduit non trouvé', 404);
    }

    await CommandeProduit.deleteOne({ idCommande, idProd });
    return { message: 'CommandeProduit supprimé avec succès' };
  }
};

module.exports = CommandeProduitService;
