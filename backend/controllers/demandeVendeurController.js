const DemandeVendeurService = require('../services/demandeVendeurService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.creerDemande = async (req, res, next) => {
  try {
    const demande = await DemandeVendeurService.createDemande(req.body);
    res.status(201).json(demande);
  } catch (err) {
    next(err);
  }
};

exports.listerDemandes = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const result = await DemandeVendeurService.getDemandes({
      page,
      limit,
      idClient: req.query.idClient,
      statut: req.query.statut,
      search: req.query.search
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDemande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const demande = await DemandeVendeurService.getDemandeById(id);
    res.json(demande);
  } catch (err) {
    next(err);
  }
};

exports.accepterDemande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const demande = await DemandeVendeurService.acceptDemande(id, req.body.commentaireAdmin);
    res.json(demande);
  } catch (err) {
    next(err);
  }
};

exports.refuserDemande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const demande = await DemandeVendeurService.rejectDemande(id, req.body.commentaireAdmin);
    res.json(demande);
  } catch (err) {
    next(err);
  }
};
