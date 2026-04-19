const { Panier } = require('../models');
const panierService = require('../services/panierService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.creerPanier = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (['client', 'vendeur'].includes(req.user.role)) {
      body.idClient = req.user.idUtilisateur;
    } else if (req.user.role !== 'admin') {
      throw new AppError('Accès refusé.', 403);
    }
    const panier = await panierService.createPanier(body);
    res.status(201).json(panier);
  } catch (err) {
    next(err);
  }
};

exports.listerPaniers = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    let idClient = req.query.idClient;
    if (['client', 'vendeur'].includes(req.user.role)) {
      idClient = req.user.idUtilisateur;
    } else if (req.user.role !== 'admin') {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await panierService.getPaniers({
      page,
      limit,
      search: req.query.search,
      idClient,
      statut: req.query.statut
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPanier = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const panier = await panierService.getPanierById(id);
    if (['client', 'vendeur'].includes(req.user.role) && panier.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }
    res.json(panier);
  } catch (err) {
    next(err);
  }
};

exports.modifierPanier = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Panier.findOne({ idPanier: id }).select('idPanier idClient');
    if (!existing) {
      throw new AppError('Panier non trouvé', 404);
    }
    if (['client', 'vendeur'].includes(req.user.role) && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const panier = await panierService.updatePanier(id, req.body);
    res.json(panier);
  } catch (err) {
    next(err);
  }
};

exports.supprimerPanier = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Panier.findOne({ idPanier: id }).select('idPanier idClient');
    if (!existing) {
      throw new AppError('Panier non trouvé', 404);
    }
    if (['client', 'vendeur'].includes(req.user.role) && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await panierService.deletePanier(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
