const notificationService = require('../services/notificationService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId } = require('../utils/validators');

exports.listerNotifications = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);
    const unreadOnly = req.query.unreadOnly === '1' || req.query.unreadOnly === 'true';

    const result = await notificationService.listForUser(req.user.idUtilisateur, {
      page,
      limit,
      unreadOnly
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.compterNonLues = async (req, res, next) => {
  try {
    const result = await notificationService.unreadCount(req.user.idUtilisateur);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.marquerLue = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }
    const n = await notificationService.markRead(req.user.idUtilisateur, id);
    res.json(n);
  } catch (err) {
    next(err);
  }
};

exports.marquerToutesLues = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user.idUtilisateur);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
