const produitFavoriService = require('../services/produitFavoriService');
const AppError = require('../middleware/AppError');

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

exports.ajouterProduitFavori = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!['client', 'vendeur', 'admin'].includes(req.user.role)) {
      throw new AppError('Accès refusé.', 403);
    }
    body.idClient = req.user.idUtilisateur;
    const produitFavori = await produitFavoriService.createProduitFavori(body);
    res.status(201).json(produitFavori);
  } catch (err) {
    next(err);
  }
};

exports.listerProduitFavoris = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    let idClient = req.query.idClient;
    let idProd = req.query.idProd;
    if (['client', 'vendeur', 'admin'].includes(req.user.role)) {
      idClient = req.user.idUtilisateur;
    } else {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await produitFavoriService.getProduitFavoris({
      page,
      limit,
      idClient,
      idProd
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProduitFavori = async (req, res, next) => {
  try {
    const idClient = parseId(req.params.idClient);
    const idProd = parseId(req.params.idProd);
    if (idClient === null || idProd === null) {
      throw new AppError('ID client ou produit invalide', 400);
    }

    if (['client', 'vendeur'].includes(req.user.role) && idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }
    if (!['admin', 'client', 'vendeur'].includes(req.user.role)) {
      throw new AppError('Accès refusé.', 403);
    }

    const favori = await produitFavoriService.getProduitFavori(idClient, idProd);
    res.json(favori);
  } catch (err) {
    next(err);
  }
};

exports.modifierProduitFavori = async (req, res, next) => {
  try {
    const idClient = parseId(req.params.idClient);
    const idProd = parseId(req.params.idProd);
    if (idClient === null || idProd === null) {
      throw new AppError('ID client ou produit invalide', 400);
    }

    if (['client', 'vendeur'].includes(req.user.role) && idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }
    if (!['admin', 'client', 'vendeur'].includes(req.user.role)) {
      throw new AppError('Accès refusé.', 403);
    }

    const favori = await produitFavoriService.updateProduitFavori(idClient, idProd, req.body);
    res.json(favori);
  } catch (err) {
    next(err);
  }
};

exports.supprimerProduitFavori = async (req, res, next) => {
  try {
    const idClient = parseId(req.params.idClient);
    const idProd = parseId(req.params.idProd);
    if (idClient === null || idProd === null) {
      throw new AppError('ID client ou produit invalide', 400);
    }

    if (['client', 'vendeur'].includes(req.user.role) && idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }
    if (!['admin', 'client', 'vendeur'].includes(req.user.role)) {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await produitFavoriService.deleteProduitFavori(idClient, idProd);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
