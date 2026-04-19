const AppError = require('../middleware/AppError');
const { Utilisateur } = require('../models');
const UtilisateurService = require('./utilisateurService');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const AdminService = {
  async createAdmin(data) {
    return await UtilisateurService.createUtilisateur({ ...data, role: 'admin' });
  },

  async getAdmins(filters = {}) {
    const { page = 1, limit = 20, search } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;

    const filter = { role: 'admin' };
    if (search) {
      const rx = escapeRegex(search);
      filter.$or = [
        { nom: { $regex: rx, $options: 'i' } },
        { prenom: { $regex: rx, $options: 'i' } },
        { email: { $regex: rx, $options: 'i' } }
      ];
    }

    const total = await Utilisateur.countDocuments(filter);
    const data = await Utilisateur.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ dateCreation: -1 })
      .select('-motDePasse')
      .lean();

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getAdminById(id) {
    const admin = await Utilisateur.findOne({
      idUtilisateur: id,
      role: 'admin'
    })
      .select('-motDePasse')
      .lean();

    if (!admin) {
      throw new AppError('Administrateur introuvable', 404);
    }

    return admin;
  },

  async updateAdmin(id, data) {
    const admin = await Utilisateur.findOne({ idUtilisateur: id, role: 'admin' });
    if (!admin) {
      throw new AppError('Administrateur introuvable', 404);
    }

    if (data.role && data.role !== 'admin') {
      throw new AppError('Impossible de changer le rôle de l’administrateur via ce service', 400);
    }

    return await UtilisateurService.updateUtilisateur(id, { ...data, role: 'admin' });
  },

  async deleteAdmin(id) {
    const admin = await Utilisateur.findOne({ idUtilisateur: id, role: 'admin' });
    if (!admin) {
      throw new AppError('Administrateur introuvable', 404);
    }

    return await UtilisateurService.deleteUtilisateur(id);
  }
};

module.exports = AdminService;
