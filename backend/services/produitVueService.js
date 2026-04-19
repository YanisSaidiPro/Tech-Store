const { ProduitVue, Produit, nextId } = require('../models');
const AppError = require('../middleware/AppError');

async function serializeVue(v) {
  const raw = v.toObject ? v.toObject() : { ...v };
  const produit = await Produit.findOne({ idProd: raw.idProd }).select('idProd nomProd').lean();
  return { ...raw, Produit: produit };
}

const ProduitVueService = {
  async createProduitVue(data) {
    const { idProd, date } = data;
    if (idProd == null || idProd === '') {
      throw new AppError('Le champ idProd est requis pour enregistrer une vue', 400);
    }

    const idProdNumber = parseInt(idProd, 10);
    if (!Number.isInteger(idProdNumber) || idProdNumber <= 0) {
      throw new AppError('idProd invalide', 400);
    }

    const idVue = await nextId('produitVue');
    const produitVue = await ProduitVue.create({
      idVue,
      idProd: idProdNumber,
      date: date ? new Date(date) : new Date()
    });
    return serializeVue(produitVue);
  },

  async getProduitVues(filters = {}) {
    const { page = 1, limit = 10, idProd, startDate, endDate } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idProd != null && idProd !== '') {
      const idProdNumber = parseInt(idProd, 10);
      if (!Number.isInteger(idProdNumber) || idProdNumber <= 0) {
        throw new AppError('idProd invalide', 400);
      }
      filter.idProd = idProdNumber;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.valueOf())) {
          throw new AppError('startDate invalide', 400);
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.valueOf())) {
          throw new AppError('endDate invalide', 400);
        }
        filter.date.$lte = end;
      }
    }

    const total = await ProduitVue.countDocuments(filter);
    const rows = await ProduitVue.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ date: -1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeVue(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getProduitVueById(id) {
    const produitVue = await ProduitVue.findOne({ idVue: id });

    if (!produitVue) {
      throw new AppError('Vue de produit introuvable', 404);
    }

    return serializeVue(produitVue);
  },

  async updateProduitVue(id, data) {
    const produitVue = await ProduitVue.findOne({ idVue: id });
    if (!produitVue) {
      throw new AppError('Vue de produit introuvable', 404);
    }

    if (data.idProd !== undefined) {
      const idProdNumber = parseInt(data.idProd, 10);
      if (!Number.isInteger(idProdNumber) || idProdNumber <= 0) {
        throw new AppError('idProd invalide', 400);
      }
      produitVue.idProd = idProdNumber;
    }

    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('date invalide', 400);
      }
      produitVue.date = parsedDate;
    }

    await produitVue.save();
    return serializeVue(produitVue);
  },

  async deleteProduitVue(id) {
    const produitVue = await ProduitVue.findOne({ idVue: id });
    if (!produitVue) {
      throw new AppError('Vue de produit introuvable', 404);
    }

    await ProduitVue.deleteOne({ idVue: id });
    return { message: 'Vue de produit supprimée avec succès' };
  }
};

module.exports = ProduitVueService;
