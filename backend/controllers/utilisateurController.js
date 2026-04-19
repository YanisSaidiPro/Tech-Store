const UtilisateurService = require('../services/utilisateurService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.ajouterUtilisateur = async (req, res, next) => {
  try {
    const utilisateur = await UtilisateurService.createUtilisateur(req.body);
    res.status(201).json(utilisateur);
  } catch (err) {
    next(err);
  }
};

exports.listerUtilisateurs = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const result = await UtilisateurService.getUtilisateurs({
      page,
      limit,
      search: req.query.search,
      role: req.query.role,
      email: req.query.email
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUtilisateur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const utilisateur = await UtilisateurService.getUtilisateurById(id);
    res.json(utilisateur);
  } catch (err) {
    next(err);
  }
};

exports.modifierUtilisateur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const utilisateur = await UtilisateurService.updateUtilisateur(id, req.body);
    res.json(utilisateur);
  } catch (err) {
    next(err);
  }
};

exports.supprimerUtilisateur = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await UtilisateurService.deleteUtilisateur(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
