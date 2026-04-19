const { Commande } = require('../models');
const commandeProduitService = require('../services/commandeProduitService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

async function assertOwnsCommande(req, idCommande) {
  if (req.user.role === 'admin') return;
  if (req.user.role !== 'client') {
    throw new AppError('Accès refusé.', 403);
  }
  const cmd = await Commande.findOne({ idCommande }).select('idCommande idClient');
  if (!cmd || cmd.idClient !== req.user.idUtilisateur) {
    throw new AppError('Accès refusé.', 403);
  }
}

exports.creerCommandeProduit = async (req, res, next) => {
  try {
    const idCommande = req.body?.idCommande;
    if (idCommande == null) {
      throw new AppError('idCommande est requis', 400);
    }
    await assertOwnsCommande(req, idCommande);
    const commandeProduit = await commandeProduitService.createCommandeProduit(req.body);
    res.status(201).json(commandeProduit);
  } catch (err) {
    next(err);
  }
};

exports.listerCommandeProduits = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    const idCommandeQ = req.query.idCommande;
    if (idCommandeQ != null) {
      await assertOwnsCommande(req, Number(idCommandeQ));
    } else if (req.user.role === 'client') {
      throw new AppError('idCommande est requis', 400);
    }

    const result = await commandeProduitService.getCommandeProduits({
      page,
      limit,
      search: req.query.search,
      idCommande: req.query.idCommande,
      idProd: req.query.idProd,
      minPrix: req.query.minPrix,
      maxPrix: req.query.maxPrix
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCommandeProduit = async (req, res, next) => {
  try {
    const idCommande = parseId(req.params.idCommande ?? req.query.idCommande);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idCommande === null || idProd === null) {
      throw new AppError('idCommande et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsCommande(req, idCommande);
    const commandeProduit = await commandeProduitService.getCommandeProduit(idCommande, idProd);
    res.json(commandeProduit);
  } catch (err) {
    next(err);
  }
};

exports.modifierCommandeProduit = async (req, res, next) => {
  try {
    const idCommande = parseId(req.params.idCommande ?? req.query.idCommande);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idCommande === null || idProd === null) {
      throw new AppError('idCommande et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsCommande(req, idCommande);
    const commandeProduit = await commandeProduitService.updateCommandeProduit(idCommande, idProd, req.body);
    res.json(commandeProduit);
  } catch (err) {
    next(err);
  }
};

exports.supprimerCommandeProduit = async (req, res, next) => {
  try {
    const idCommande = parseId(req.params.idCommande ?? req.query.idCommande);
    const idProd = parseId(req.params.idProd ?? req.query.idProd);

    if (idCommande === null || idProd === null) {
      throw new AppError('idCommande et idProd sont requis et doivent être valides', 400);
    }

    await assertOwnsCommande(req, idCommande);
    const result = await commandeProduitService.deleteCommandeProduit(idCommande, idProd);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
