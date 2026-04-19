const AdminService = require('../services/adminService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.ajouterAdmin = async (req, res, next) => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    res.status(201).json(admin);
  } catch (err) {
    next(err);
  }
};

exports.listerAdmins = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const result = await AdminService.getAdmins({
      page,
      limit,
      search: req.query.search
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const admin = await AdminService.getAdminById(id);
    res.json(admin);
  } catch (err) {
    next(err);
  }
};

exports.modifierAdmin = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const admin = await AdminService.updateAdmin(id, req.body);
    res.json(admin);
  } catch (err) {
    next(err);
  }
};

exports.supprimerAdmin = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const result = await AdminService.deleteAdmin(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
