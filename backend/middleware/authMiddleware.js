const AppError = require('./AppError');
const { verifyToken } = require('../utils/jwt');
const { Utilisateur } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Token manquant. Authentification requise.', 401);
    }

    const decoded = verifyToken(token);
    const utilisateur = await Utilisateur.findOne({ idUtilisateur: decoded.id }).select(
      '-motDePasse'
    );

    if (!utilisateur) {
      throw new AppError('Utilisateur introuvable pour ce token', 401);
    }

    req.user = utilisateur;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expiré. Veuillez vous reconnecter.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide. Authentification requise.', 401));
    }
    next(err);
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Accès refusé.', 403));
  }
  next();
};
