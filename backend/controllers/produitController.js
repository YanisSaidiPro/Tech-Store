const produitService = require('../services/produitService');
const AppError = require('../middleware/AppError');

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOptionalNumber = (value) => {
  if (value == null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseSortField = (value) => {
  const allowed = new Set(['createdAt', 'prix', 'nomProd']);
  return allowed.has(value) ? value : 'createdAt';
};

const parseSortOrder = (value) => {
  return String(value || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
};

const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

// Ajouter un produit
exports.ajouterProduit = async (req, res, next) => {
  try {
    const produit = await produitService.createProduit(req.body);
    res.status(201).json(produit);
  } catch (err) {
    next(err);
  }
};

// Lister tous les produits avec filtres et pagination
exports.listerProduits = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);
    const minPrix = parseOptionalNumber(req.query.minPrix);
    const maxPrix = parseOptionalNumber(req.query.maxPrix);

    const result = await produitService.getProduits({
      page,
      limit,
      categorie: req.query.categorie,
      search: req.query.search,
      minPrix,
      maxPrix,
      sortBy: parseSortField(req.query.sortBy),
      sortOrder: parseSortOrder(req.query.sortOrder)
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Recuperer un produit
exports.getProduit = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const produit = await produitService.getProduitById(id);
    res.json(produit);
  } catch (err) {
    next(err);
  }
};

// Modifier un produit
exports.modifierProduit = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const produit = await produitService.updateProduit(id, req.body);
    res.json(produit);
  } catch (err) {
    next(err);
  }
};

// Supprimer un produit
exports.supprimerProduit = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await produitService.deleteProduit(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// TRENDING (préparation IA)
exports.getProduitsTendance = async (req, res, next) => {
  try {
    const limit = parseNumber(req.query.limit, 10);
    const produits = await produitService.getTrendingProduits(limit);
    res.json(produits);
  } catch (err) {
    next(err);
  }
};