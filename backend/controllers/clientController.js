const ClientService = require('../services/clientService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.ajouterClient = async (req, res, next) => {
  try {
    const client = await ClientService.createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

exports.listerClients = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const result = await ClientService.getClients({
      page,
      limit,
      search: req.query.search
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getClient = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const client = await ClientService.getClientById(id);
    res.json(client);
  } catch (err) {
    next(err);
  }
};

exports.modifierClient = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const client = await ClientService.updateClient(id, req.body);
    res.json(client);
  } catch (err) {
    next(err);
  }
};

exports.supprimerClient = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await ClientService.deleteClient(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
