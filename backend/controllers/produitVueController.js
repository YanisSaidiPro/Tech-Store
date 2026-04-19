const produitVueService = require('../services/produitVueService');
const AppError = require('../middleware/AppError');

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

exports.ajouterProduitVue = async (req, res, next) => {
  try {
    const produitVue = await produitVueService.createProduitVue(req.body);
    res.status(201).json(produitVue);
  } catch (err) {
    next(err);
  }
};

exports.listerProduitVues = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    const result = await produitVueService.getProduitVues({
      page,
      limit,
      idProd: req.query.idProd,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProduitVue = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const produitVue = await produitVueService.getProduitVueById(id);
    res.json(produitVue);
  } catch (err) {
    next(err);
  }
};

exports.modifierProduitVue = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const produitVue = await produitVueService.updateProduitVue(id, req.body);
    res.json(produitVue);
  } catch (err) {
    next(err);
  }
};

exports.supprimerProduitVue = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await produitVueService.deleteProduitVue(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
