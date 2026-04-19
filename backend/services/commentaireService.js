const { Commentaire, Produit, Utilisateur, nextId } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function serializeCommentaire(c) {
  const raw = c.toObject ? c.toObject() : { ...c };
  const produit = await Produit.findOne({ idProd: raw.idProd }).select('idProd nomProd prix').lean();
  const u = await Utilisateur.findOne({ idUtilisateur: raw.idClient })
    .select('idUtilisateur nom prenom email photoProfil role')
    .lean();
  return {
    ...raw,
    idProduit: raw.idProd,
    images: Array.isArray(raw.images) ? raw.images : [],
    Produit: produit,
    Client: {
      idClient: raw.idClient,
      Utilisateur: u
        ? {
            idUtilisateur: u.idUtilisateur,
            nom: u.nom,
            prenom: u.prenom,
            email: u.email,
            photoProfil: u.photoProfil,
            role: u.role
          }
        : null
    }
  };
}

const CommentaireService = {
  async createCommentaire(data) {
    const noteRaw = data.note != null ? parseInt(data.note, 10) : null;
    const idProd = data.idProduit ?? data.idProd;
    const { titre, contenu, idClient } = data;

    if (idClient == null || idProd == null) {
      throw new AppError('idClient et idProduit sont requis', 400);
    }

    let images = [];
    if (Array.isArray(data.images)) {
      images = data.images
        .map((u) => String(u).trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    if (noteRaw == null || Number.isNaN(noteRaw) || noteRaw < 0 || noteRaw > 5) {
      throw new AppError('La note doit être un entier entre 0 et 5', 400);
    }

    const idCommentaire = await nextId('commentaire');
    const commentaire = await Commentaire.create({
      idCommentaire,
      note: noteRaw,
      titre: titre ? String(titre).trim() : null,
      contenu: contenu ? String(contenu).trim() : null,
      idClient,
      idProd,
      images
    });

    return serializeCommentaire(commentaire);
  },

  async getCommentaires(filters = {}) {
    const { page = 1, limit = 10, search, idProduit, idClient, minNote, maxNote } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idProduit != null) {
      filter.idProd = idProduit;
    }

    if (idClient != null) {
      filter.idClient = idClient;
    }

    if (search) {
      filter.contenu = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (minNote != null) {
      filter.note = { ...filter.note, $gte: parseInt(minNote, 10) };
    }
    if (maxNote != null) {
      filter.note = { ...filter.note, $lte: parseInt(maxNote, 10) };
    }

    const total = await Commentaire.countDocuments(filter);
    const rows = await Commentaire.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ date: -1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeCommentaire(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getCommentaireById(id) {
    const commentaire = await Commentaire.findOne({ idCommentaire: id });

    if (!commentaire) {
      throw new AppError('Commentaire non trouvé', 404);
    }

    return serializeCommentaire(commentaire);
  },

  async updateCommentaire(id, data) {
    const commentaire = await Commentaire.findOne({ idCommentaire: id });
    if (!commentaire) {
      throw new AppError('Commentaire non trouvé', 404);
    }

    if (data.note !== undefined) {
      const parsedNote = parseInt(data.note, 10);
      if (Number.isNaN(parsedNote) || parsedNote < 0 || parsedNote > 5) {
        throw new AppError('La note doit être un entier entre 0 et 5', 400);
      }
      commentaire.note = parsedNote;
    }

    if (data.titre !== undefined) {
      commentaire.titre = data.titre ? String(data.titre).trim() : null;
    }

    if (data.contenu !== undefined) {
      commentaire.contenu = data.contenu ? String(data.contenu).trim() : null;
    }

    if (data.images !== undefined) {
      commentaire.images = Array.isArray(data.images)
        ? data.images
            .map((u) => String(u).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];
    }

    await commentaire.save();
    return serializeCommentaire(commentaire);
  },

  async deleteCommentaire(id) {
    const commentaire = await Commentaire.findOne({ idCommentaire: id });
    if (!commentaire) {
      throw new AppError('Commentaire non trouvé', 404);
    }

    await Commentaire.deleteOne({ idCommentaire: id });
    return { message: 'Commentaire supprimé avec succès' };
  }
};

module.exports = CommentaireService;
