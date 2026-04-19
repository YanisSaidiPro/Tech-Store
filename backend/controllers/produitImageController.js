const { Produit, ProduitImage } = require('../models');
const produitImageService = require('../services/produitImageService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

async function assertVendeurOwnsProduct(req, idProd) {
  if (idProd == null) {
    throw new AppError('idProd requis', 400);
  }
  if (req.user.role === 'admin') {
    return;
  }
  if (req.user.role !== 'vendeur') {
    throw new AppError('Accès refusé.', 403);
  }
  const p = await Produit.findOne({ idProd }).select('idVendeur').lean();
  if (!p || p.idVendeur !== req.user.idUtilisateur) {
    throw new AppError('Accès refusé.', 403);
  }
}

async function assertVendeurOwnsProductForImageId(req, idImage) {
  if (req.user.role === 'admin') {
    return;
  }
  if (req.user.role !== 'vendeur') {
    throw new AppError('Accès refusé.', 403);
  }
  const img = await ProduitImage.findOne({ idImage }).select('idProd').lean();
  if (!img) {
    throw new AppError('Image introuvable', 404);
  }
  const p = await Produit.findOne({ idProd: img.idProd }).select('idVendeur').lean();
  if (!p || p.idVendeur !== req.user.idUtilisateur) {
    throw new AppError('Accès refusé.', 403);
  }
}

exports.creerProduitImage = async (req, res, next) => {
  try {
    await assertVendeurOwnsProduct(req, req.body.idProd);
    const image = await produitImageService.createProduitImage(req.body);
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
};

exports.listerProduitImages = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    const result = await produitImageService.getProduitImages({
      page,
      limit,
      search: req.query.search,
      idProd: req.query.idProd,
      isMain: req.query.isMain
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProduitImage = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const image = await produitImageService.getProduitImageById(id);
    res.json(image);
  } catch (err) {
    next(err);
  }
};

exports.modifierProduitImage = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    await assertVendeurOwnsProductForImageId(req, id);
    const image = await produitImageService.updateProduitImage(id, req.body);
    res.json(image);
  } catch (err) {
    next(err);
  }
};

exports.supprimerProduitImage = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    await assertVendeurOwnsProductForImageId(req, id);
    const result = await produitImageService.deleteProduitImage(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
