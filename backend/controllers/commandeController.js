const { Commande } = require('../models');
const commandeService = require('../services/commandeService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId, parseDate } = require('../utils/validators');

exports.creerCommande = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.user.role === 'client') {
      body.idClient = req.user.idUtilisateur;
    } else if (req.user.role !== 'admin') {
      throw new AppError('Accès refusé.', 403);
    }
    const commande = await commandeService.createCommande(body);
    res.status(201).json(commande);
  } catch (err) {
    next(err);
  }
};

exports.listerCommandes = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    let idClient = req.query.idClient;
    if (req.user.role === 'client') {
      idClient = req.user.idUtilisateur;
    } else if (req.user.role !== 'admin') {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await commandeService.getCommandes({
      page,
      limit,
      search: req.query.search,
      idClient,
      statut: req.query.statut,
      minTotal: req.query.minTotal,
      maxTotal: req.query.maxTotal
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCommande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const commande = await commandeService.getCommandeById(id);
    if (req.user.role === 'client' && commande.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }
    res.json(commande);
  } catch (err) {
    next(err);
  }
};

exports.modifierCommande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Commande.findOne({ idCommande: id }).select('idCommande idClient');
    if (!existing) {
      throw new AppError('Commande non trouvée', 404);
    }
    if (req.user.role === 'client' && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const data = { ...req.body };
    if (data.date !== undefined) {
      data.date = parseDate(data.date);
      if (data.date === null) {
        throw new AppError('Date invalide', 400);
      }
    }

    const commande = await commandeService.updateCommande(id, data);
    res.json(commande);
  } catch (err) {
    next(err);
  }
};

exports.supprimerCommande = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const existing = await Commande.findOne({ idCommande: id }).select('idCommande idClient');
    if (!existing) {
      throw new AppError('Commande non trouvée', 404);
    }
    if (req.user.role === 'client' && existing.idClient !== req.user.idUtilisateur) {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await commandeService.deleteCommande(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
