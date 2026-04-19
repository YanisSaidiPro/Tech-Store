const bcrypt = require('bcryptjs');
const AppError = require('../middleware/AppError');
const { Utilisateur } = require('../models');
const { signToken } = require('../utils/jwt');
const { isValidEmail } = require('../utils/validators');
const UtilisateurService = require('./utilisateurService');

const AuthService = {
  async login(data) {
    const { email, motDePasse } = data;

    if (!email || !motDePasse) {
      throw new AppError('email et motDePasse sont requis', 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError('Adresse email invalide', 400);
    }

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      throw new AppError('Email ou mot de passe invalide', 401);
    }

    const validPassword = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!validPassword) {
      throw new AppError('Email ou mot de passe invalide', 401);
    }

    const token = signToken({ id: utilisateur.idUtilisateur, role: utilisateur.role });
    const userPayload = utilisateur.toJSON();

    return { token, utilisateur: userPayload };
  },

  async register(data) {
    const utilisateur = await UtilisateurService.createUtilisateur(data);
    const token = signToken({ id: utilisateur.idUtilisateur, role: utilisateur.role });
    return { token, utilisateur };
  }
};

module.exports = AuthService;
