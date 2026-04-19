const { Panier, Produit } = require('../models');
const contientService = require('../services/contientService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

async function assertOwnsPanier(req, idPanier) {
  if (req.user.role === 'admin') return;
  if (!['client', 'vendeur'].includes(req.user.role)) {
    throw new AppError('Accès refusé.', 403);
  }
  const panier = await Panier.findOne({ idPanier }).select('idPanier idClient');
  if (!panier || panier.idClient !== req.user.idUtilisateur) {
    throw new AppError('Accès refusé.', 403);
  }
}

async function assertVendorCannotAddOwnProduct(req, idProd) {
  if (req.user.role !== 'vendeur') return;
  const p = await Produit.findOne({ idProd }).select('idVendeur').lean();
  if (p && p.idVendeur === req.user.idUtilisateur) {
    throw new AppError('Un vendeur ne peut pas ajouter ses propres produits au panier.', 403);
  }
}

exports.creerContient = async (req, res, next) => {
  try {
    const idPanier = req.body?.idPanier;
    if (idPanier == null) {
      throw new AppError('idPanier est requis', 400);
    }
    const idProd = parseId(req.body?.idProd);
    if (idProd === null) {
      throw new AppError('idProd est requis et doit être valide', 400);
    }
    await assertOwnsPanier(req, idPanier);
    await assertVendorCannotAddOwnProduct(req, idProd);
    const contient = await contientService.createContient(req.body);
    res.status(201).json(contient);
  } catch (err) {
    next(err);
  }
};

exports.listerContients = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    const idPanierQ = req.query.idPanier;
    if (idPanierQ != null) {
      await assertOwnsPanier(req, Number(idPanierQ));
    } else if (['client', 'vendeur'].includes(req.user.role)) {
      throw new AppError('idPanier est requis', 400);
    }

    const result = await contientService.getContients({
      page,
      limit,
      search: req.query.search,
      idPanier: req.query.idPanier,
      idProd: req.query.idProd
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getContient = async (req, res, next) => {
  try {
    const idPanier = parseId(req.params.idPanier ?? req.query.idPanier);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idPanier === null || idProd === null) {
      throw new AppError('idPanier et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsPanier(req, idPanier);
    const contient = await contientService.getContient(idPanier, idProd);
    res.json(contient);
  } catch (err) {
    next(err);
  }
};

exports.modifierContient = async (req, res, next) => {
  try {
    const idPanier = parseId(req.params.idPanier ?? req.query.idPanier);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idPanier === null || idProd === null) {
      throw new AppError('idPanier et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsPanier(req, idPanier);
    await assertVendorCannotAddOwnProduct(req, idProd);
    const contient = await contientService.updateContient(idPanier, idProd, req.body);
    res.json(contient);
  } catch (err) {
    next(err);
  }
};

exports.supprimerContient = async (req, res, next) => {
  try {
    const idPanier = parseId(req.params.idPanier ?? req.query.idPanier);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idPanier === null || idProd === null) {
      throw new AppError('idPanier et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsPanier(req, idPanier);
    const result = await contientService.deleteContient(idPanier, idProd);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
