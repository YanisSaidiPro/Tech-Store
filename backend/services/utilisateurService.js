const bcrypt = require('bcryptjs');
const { Utilisateur, nextId } = require('../models');
const AppError = require('../middleware/AppError');
const { isValidEmail, parseDate, isValidRole } = require('../utils/validators');

const SALT_ROUNDS = 10;

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeUtilisateur = (utilisateur) => {
  const result = utilisateur.toJSON ? utilisateur.toJSON() : { ...utilisateur };
  delete result.motDePasse;
  return result;
};

const UtilisateurService = {
  async createUtilisateur(data) {
    const { nom, prenom, dateNaiss, email, motDePasse, adresse, photoProfil, role } = data;

    if (!email || !motDePasse || !role) {
      throw new AppError('email, motDePasse et role sont requis', 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError('Adresse email invalide', 400);
    }

    if (motDePasse.length < 6) {
      throw new AppError('Le mot de passe doit contenir au moins 6 caractères', 400);
    }

    if (!isValidRole(role)) {
      throw new AppError('Role invalide', 400);
    }

    const existing = await Utilisateur.findOne({ email });
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    let parsedDate;
    if (dateNaiss !== undefined) {
      parsedDate = parseDate(dateNaiss);
      if (parsedDate === null) {
        throw new AppError('dateNaiss invalide', 400);
      }
    }

    const passwordHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
    const idUtilisateur = await nextId('utilisateur');

    const utilisateur = await Utilisateur.create({
      idUtilisateur,
      nom,
      prenom,
      dateNaiss: parsedDate,
      email,
      motDePasse: passwordHash,
      adresse,
      photoProfil: photoProfil ? String(photoProfil).trim() : null,
      role
    });

    return sanitizeUtilisateur(utilisateur);
  },

  async getUtilisateurs(filters = {}) {
    const { page = 1, limit = 20, search, role, email } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (search) {
      const rx = escapeRegex(search);
      filter.$or = [
        { nom: { $regex: rx, $options: 'i' } },
        { prenom: { $regex: rx, $options: 'i' } },
        { email: { $regex: rx, $options: 'i' } }
      ];
    }

    if (role) {
      if (!isValidRole(role)) {
        throw new AppError('Role invalide', 400);
      }
      filter.role = role;
    }

    if (email) {
      if (!isValidEmail(email)) {
        throw new AppError('Adresse email invalide', 400);
      }
      filter.email = email;
    }

    const total = await Utilisateur.countDocuments(filter);
    const rows = await Utilisateur.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ dateCreation: -1 })
      .select('-motDePasse')
      .lean();

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data: rows
    };
  },

  async getUtilisateurById(id) {
    const utilisateur = await Utilisateur.findOne({ idUtilisateur: id }).select('-motDePasse').lean();

    if (!utilisateur) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return utilisateur;
  },

  async updateUtilisateur(id, data) {
    const utilisateur = await Utilisateur.findOne({ idUtilisateur: id });
    if (!utilisateur) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (data.email && data.email !== utilisateur.email) {
      if (!isValidEmail(data.email)) {
        throw new AppError('Adresse email invalide', 400);
      }
      const existing = await Utilisateur.findOne({ email: data.email });
      if (existing && existing.idUtilisateur !== id) {
        throw new AppError('Cet email est déjà utilisé', 409);
      }
      utilisateur.email = data.email;
    }

    if (data.motDePasse !== undefined) {
      if (data.motDePasse.length < 6) {
        throw new AppError('Le mot de passe doit contenir au moins 6 caractères', 400);
      }
      utilisateur.motDePasse = await bcrypt.hash(data.motDePasse, SALT_ROUNDS);
    }

    if (data.dateNaiss !== undefined) {
      const parsedDate = parseDate(data.dateNaiss);
      if (parsedDate === null) {
        throw new AppError('dateNaiss invalide', 400);
      }
      utilisateur.dateNaiss = parsedDate;
    }

    if (data.photoProfil !== undefined) {
      utilisateur.photoProfil = data.photoProfil ? String(data.photoProfil).trim() : null;
    }

    if (data.nom !== undefined) utilisateur.nom = data.nom;
    if (data.prenom !== undefined) utilisateur.prenom = data.prenom;
    if (data.adresse !== undefined) utilisateur.adresse = data.adresse;

    if (data.role !== undefined && data.role !== utilisateur.role) {
      if (!isValidRole(data.role)) {
        throw new AppError('Role invalide', 400);
      }
      utilisateur.role = data.role;
    }

    await utilisateur.save();
    return sanitizeUtilisateur(utilisateur);
  },

  async deleteUtilisateur(id) {
    const utilisateur = await Utilisateur.findOne({ idUtilisateur: id });
    if (!utilisateur) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    await Utilisateur.deleteOne({ idUtilisateur: id });
    return { message: 'Utilisateur supprimé avec succès' };
  }
};

module.exports = UtilisateurService;
