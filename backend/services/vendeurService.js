const AppError = require('../middleware/AppError');
const { Utilisateur } = require('../models');
const UtilisateurService = require('./utilisateurService');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const VendeurService = {
  async createVendeur(data) {
    return await UtilisateurService.createUtilisateur({ ...data, role: 'vendeur' });
  },

  async getVendeurs(filters = {}) {
    const { page = 1, limit = 20, search } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;

    const filter = { role: 'vendeur' };
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

  async getVendeurById(id) {
    const vendeur = await Utilisateur.findOne({
      idUtilisateur: id,
      role: 'vendeur'
    })
      .select('-motDePasse')
      .lean();

    if (!vendeur) {
      throw new AppError('Vendeur introuvable', 404);
    }

    return vendeur;
  },

  async updateVendeur(id, data) {
    const vendeur = await Utilisateur.findOne({ idUtilisateur: id, role: 'vendeur' });
    if (!vendeur) {
      throw new AppError('Vendeur introuvable', 404);
    }

    if (data.role && data.role !== 'vendeur') {
      throw new AppError('Impossible de changer le rôle du vendeur via ce service', 400);
    }

    return await UtilisateurService.updateUtilisateur(id, { ...data, role: 'vendeur' });
  },

  async deleteVendeur(id) {
    const vendeur = await Utilisateur.findOne({ idUtilisateur: id, role: 'vendeur' });
    if (!vendeur) {
      throw new AppError('Vendeur introuvable', 404);
    }

    return await UtilisateurService.deleteUtilisateur(id);
  }
};

module.exports = VendeurService;
