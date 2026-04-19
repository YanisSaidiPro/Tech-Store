const { Categorie, nextId } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CategorieService = {
  async createCategorie(data) {
    const { nomCat } = data;

    if (nomCat == null || nomCat.toString().trim() === '') {
      throw new AppError('nomCat est requis', 400);
    }

    const nomCatTrimmed = nomCat.toString().trim();
    const existing = await Categorie.findOne({ nomCat: nomCatTrimmed });
    if (existing) {
      throw new AppError('Cette catégorie existe déjà', 409);
    }

    const idCategorie = await nextId('categorie');
    const categorie = await Categorie.create({ idCategorie, nomCat: nomCatTrimmed });
    return categorie.toObject();
  },

  async getCategories(filters = {}) {
    const { page = 1, limit = 20, search } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (search) {
      filter.nomCat = { $regex: escapeRegex(search), $options: 'i' };
    }

    const total = await Categorie.countDocuments(filter);
    const rows = await Categorie.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ nomCat: 1 })
      .lean();

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data: rows
    };
  },

  async getCategorieById(id) {
    const categorie = await Categorie.findOne({ idCategorie: id }).lean();

    if (!categorie) {
      throw new AppError('Categorie non trouvée', 404);
    }

    return categorie;
  },

  async updateCategorie(id, data) {
    const categorie = await Categorie.findOne({ idCategorie: id });
    if (!categorie) {
      throw new AppError('Categorie non trouvée', 404);
    }

    if (data.nomCat !== undefined && data.nomCat.toString().trim() === '') {
      throw new AppError('nomCat ne peut pas être vide', 400);
    }

    if (data.nomCat != null) {
      const nomCatTrimmed = data.nomCat.toString().trim();
      const existing = await Categorie.findOne({ nomCat: nomCatTrimmed });
      if (existing && existing.idCategorie !== id) {
        throw new AppError('Cette catégorie existe déjà', 409);
      }
      categorie.nomCat = nomCatTrimmed;
    }

    await categorie.save();
    return categorie.toObject();
  },

  async deleteCategorie(id) {
    const categorie = await Categorie.findOne({ idCategorie: id });
    if (!categorie) {
      throw new AppError('Categorie non trouvée', 404);
    }

    await Categorie.deleteOne({ idCategorie: id });
    return { message: 'Categorie supprimée avec succès' };
  }
};

module.exports = CategorieService;
