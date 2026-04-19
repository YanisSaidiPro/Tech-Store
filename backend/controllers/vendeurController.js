const VendeurService = require('../services/vendeurService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.ajouterVendeur = async (req, res, next) => {
  try {
    const vendeur = await VendeurService.createVendeur(req.body);
    res.status(201).json(vendeur);
  } catch (err) {
    next(err);
  }
};

exports.listerVendeurs = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const result = await VendeurService.getVendeurs({
      page,
      limit,
      search: req.query.search
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getVendeur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const vendeur = await VendeurService.getVendeurById(id);
    res.json(vendeur);
  } catch (err) {
    next(err);
  }
};

exports.modifierVendeur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const vendeur = await VendeurService.updateVendeur(id, req.body);
    res.json(vendeur);
  } catch (err) {
    next(err);
  }
};

exports.supprimerVendeur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await VendeurService.deleteVendeur(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
