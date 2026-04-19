const { DemandeVendeur, Utilisateur, nextId } = require('../models');
const AppError = require('../middleware/AppError');
const UtilisateurService = require('./utilisateurService');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DemandeVendeurService = {
  async createDemande(data) {
    const { idClient, contactTel, contenu } = data;

    if (!idClient) {
      throw new AppError('idClient est requis', 400);
    }

    const clientId = parseInt(idClient, 10);
    if (!Number.isInteger(clientId) || clientId <= 0) {
      throw new AppError('idClient invalide', 400);
    }

    const client = await Utilisateur.findOne({
      idUtilisateur: clientId,
      role: { $in: ['client', 'vendeur'] }
    });
    if (!client) {
      throw new AppError('Client introuvable', 404);
    }

    const existingRequest = await DemandeVendeur.findOne({
      idClient: clientId,
      statut: 'en_attente'
    });
    if (existingRequest) {
      throw new AppError('Une demande en attente existe déjà pour ce client', 409);
    }

    const idDemande = await nextId('demandeVendeur');
    const demande = await DemandeVendeur.create({
      idDemande,
      idClient: clientId,
      contactTel,
      contenu,
      statut: 'en_attente'
    });

    return demande.toObject();
  },

  async getDemandes(filters = {}) {
    const { page = 1, limit = 20, idClient, statut, search } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idClient) {
      const clientId = parseInt(idClient, 10);
      if (!Number.isInteger(clientId) || clientId <= 0) {
        throw new AppError('idClient invalide', 400);
      }
      filter.idClient = clientId;
    }

    if (statut) {
      filter.statut = statut;
    }

    if (search) {
      const rx = escapeRegex(search);
      filter.$or = [
        { contactTel: { $regex: rx, $options: 'i' } },
        { contenu: { $regex: rx, $options: 'i' } },
        { commentaireAdmin: { $regex: rx, $options: 'i' } }
      ];
    }

    const total = await DemandeVendeur.countDocuments(filter);
    const data = await DemandeVendeur.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ date: -1 })
      .lean();

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getDemandeById(id) {
    const demande = await DemandeVendeur.findOne({ idDemande: id }).lean();
    if (!demande) {
      throw new AppError('Demande introuvable', 404);
    }

    return demande;
  },

  async acceptDemande(id, commentaireAdmin) {
    const demande = await DemandeVendeur.findOne({ idDemande: id });
    if (!demande) {
      throw new AppError('Demande introuvable', 404);
    }

    if (demande.statut !== 'en_attente') {
      throw new AppError('Seule une demande en attente peut être acceptée', 400);
    }

    const utilisateur = await Utilisateur.findOne({ idUtilisateur: demande.idClient });
    if (!utilisateur) {
      throw new AppError('Utilisateur associé introuvable', 404);
    }

    if (utilisateur.role === 'vendeur') {
      throw new AppError('Cet utilisateur est déjà vendeur', 400);
    }

    demande.statut = 'acceptee';
    demande.commentaireAdmin = commentaireAdmin;
    await demande.save();

    await UtilisateurService.updateUtilisateur(utilisateur.idUtilisateur, {
      role: 'vendeur'
    });

    return demande.toObject();
  },

  async rejectDemande(id, commentaireAdmin) {
    const demande = await DemandeVendeur.findOne({ idDemande: id });
    if (!demande) {
      throw new AppError('Demande introuvable', 404);
    }

    if (demande.statut !== 'en_attente') {
      throw new AppError('Seule une demande en attente peut être refusée', 400);
    }

    demande.statut = 'refusee';
    demande.commentaireAdmin = commentaireAdmin;
    await demande.save();

    return demande.toObject();
  }
};

module.exports = DemandeVendeurService;
