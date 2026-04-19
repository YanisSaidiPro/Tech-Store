const { Commentaire } = require('../models');
const commentaireService = require('../services/commentaireService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.creerCommentaire = async (req, res, next) => {
  try {
    if (!req.user || !['client', 'vendeur', 'admin'].includes(req.user.role)) {
      throw new AppError('Accès refusé.', 403);
    }
    const body = { ...req.body, idClient: req.user.idUtilisateur };
    const commentaire = await commentaireService.createCommentaire(body);
    res.status(201).json(commentaire);
  } catch (err) {
    next(err);
  }
};

exports.listerCommentaires = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    const result = await commentaireService.getCommentaires({
      page,
      limit,
      search: req.query.search,
      idProduit: req.query.idProduit,
      idClient: req.query.idClient,
      minNote: req.query.minNote,
      maxNote: req.query.maxNote
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCommentaire = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const commentaire = await commentaireService.getCommentaireById(id);
    res.json(commentaire);
  } catch (err) {
    next(err);
  }
};

exports.modifierCommentaire = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Commentaire.findOne({ idCommentaire: id }).select('idClient');
    if (!existing) {
      throw new AppError('Commentaire non trouvé', 404);
    }
    if (req.user.role !== 'admin' && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const commentaire = await commentaireService.updateCommentaire(id, req.body);
    res.json(commentaire);
  } catch (err) {
    next(err);
  }
};

exports.supprimerCommentaire = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Commentaire.findOne({ idCommentaire: id }).select('idClient');
    if (!existing) {
      throw new AppError('Commentaire non trouvé', 404);
    }
    if (req.user.role !== 'admin' && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await commentaireService.deleteCommentaire(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
