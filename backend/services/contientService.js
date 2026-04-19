const { Contient, Panier, Produit, Utilisateur } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function serializeContientRow(c) {
  const panier = await Panier.findOne({ idPanier: c.idPanier }).lean();
  const clientUser = panier
    ? await Utilisateur.findOne({ idUtilisateur: panier.idClient }).select('idUtilisateur').lean()
    : null;
  const produit = await Produit.findOne({ idProd: c.idProd }).select('idProd nomProd prix').lean();
  return {
    ...c,
    Panier: panier
      ? {
          ...panier,
          Client: clientUser ? { idClient: clientUser.idUtilisateur } : null
        }
      : null,
    Produit: produit
  };
}

const ContientService = {
  async createContient(data) {
    const { idPanier, idProd, qte, unite } = data;
    const quantity = qte != null ? Number(qte) : null;

    if (idPanier == null || idProd == null) {
      throw new AppError('idPanier et idProd sont requis', 400);
    }

    if (quantity == null || Number.isNaN(quantity) || quantity <= 0) {
      throw new AppError('La quantité doit être un nombre strictement positif', 400);
    }

    const existing = await Contient.findOne({ idPanier, idProd });
    if (existing) {
      existing.qte = existing.qte + quantity;
      if (unite !== undefined) {
        existing.unite = unite ? String(unite).trim() : existing.unite;
      }
      await existing.save();
      return existing.toObject();
    }

    const contient = await Contient.create({
      idPanier,
      idProd,
      qte: quantity,
      unite: unite ? String(unite).trim() : null
    });

    return contient.toObject();
  },

  async getContients(filters = {}) {
    const { page = 1, limit = 10, search, idPanier, idProd } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (idPanier != null) {
      filter.idPanier = idPanier;
    }
    if (idProd != null) {
      filter.idProd = idProd;
    }
    if (search) {
      filter.unite = { $regex: escapeRegex(search), $options: 'i' };
    }

    const total = await Contient.countDocuments(filter);
    const rows = await Contient.find(filter).skip(offset).limit(limitNumber).sort({ idPanier: 1 }).lean();

    const data = await Promise.all(rows.map((r) => serializeContientRow(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getContient(idPanier, idProd) {
    if (idPanier == null || idProd == null) {
      throw new AppError('idPanier et idProd sont requis', 400);
    }

    const contient = await Contient.findOne({ idPanier, idProd }).lean();

    if (!contient) {
      throw new AppError('Contient non trouvé', 404);
    }

    return serializeContientRow(contient);
  },

  async updateContient(idPanier, idProd, data) {
    const contient = await Contient.findOne({ idPanier, idProd });
    if (!contient) {
      throw new AppError('Contient non trouvé', 404);
    }

    if (data.qte !== undefined) {
      const quantity = Number(data.qte);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new AppError('La quantité doit être un nombre strictement positif', 400);
      }
      contient.qte = quantity;
    }

    if (data.unite !== undefined) {
      contient.unite = data.unite ? String(data.unite).trim() : null;
    }

    await contient.save();
    return contient.toObject();
  },

  async deleteContient(idPanier, idProd) {
    const contient = await Contient.findOne({ idPanier, idProd });
    if (!contient) {
      throw new AppError('Contient non trouvé', 404);
    }

    await Contient.deleteOne({ idPanier, idProd });
    return { message: 'Entrée Contient supprimée avec succès' };
  }
};

module.exports = ContientService;
