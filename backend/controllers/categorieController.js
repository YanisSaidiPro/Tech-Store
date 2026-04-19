const CategorieService = require('../services/categorieService');
const AppError = require('../middleware/AppError');

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

exports.ajouterCategorie = async (req, res, next) => {
  try {
    const categorie = await CategorieService.createCategorie(req.body);
    res.status(201).json(categorie);
  } catch (err) {
    next(err);
  }
};

exports.listerCategories = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);
    const search = req.query.search;

    const result = await CategorieService.getCategories({
      page,
      limit,
      search
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCategorie = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const categorie = await CategorieService.getCategorieById(id);
    res.json(categorie);
  } catch (err) {
    next(err);
  }
};

exports.modifierCategorie = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const categorie = await CategorieService.updateCategorie(id, req.body);
    res.json(categorie);
  } catch (err) {
    next(err);
  }
};

exports.supprimerCategorie = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await CategorieService.deleteCategorie(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
