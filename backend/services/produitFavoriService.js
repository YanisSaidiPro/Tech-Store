const { ProduitFavori, Produit, Utilisateur } = require('../models');
const AppError = require('../middleware/AppError');

async function serializeFavori(row) {
  const raw = row.toObject ? row.toObject() : { ...row };
  const produit = await Produit.findOne({ idProd: raw.idProd }).select('idProd nomProd').lean();
  return {
    ...raw,
    Produit: produit,
    Client: { idClient: raw.idClient }
  };
}

const ProduitFavoriService = {
  async createProduitFavori(data) {
    const { idClient, idProd, date } = data;
    if (idClient == null || idClient === '' || idProd == null || idProd === '') {
      throw new AppError('Les champs idClient et idProd sont requis pour ajouter un favori', 400);
    }

    const clientId = parseInt(idClient, 10);
    const produitId = parseInt(idProd, 10);
    if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isInteger(produitId) || produitId <= 0) {
      throw new AppError('idClient ou idProd invalide', 400);
    }

    let dateValue;
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('date invalide', 400);
      }
      dateValue = parsedDate;
    }

    const existingFavori = await ProduitFavori.findOne({
      idClient: clientId,
      idProd: produitId
    });
    if (existingFavori) {
      throw new AppError('Ce produit est déjà en favori pour ce client', 409);
    }

    const produitFavori = await ProduitFavori.create({
      idClient: clientId,
      idProd: produitId,
      date: dateValue || new Date()
    });
    return serializeFavori(produitFavori);
  },

  async getProduitFavoris(filters = {}) {
    const { page = 1, limit = 10, idClient, idProd } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idClient != null && idClient !== '') {
      const clientId = parseInt(idClient, 10);
      if (!Number.isInteger(clientId) || clientId <= 0) {
        throw new AppError('idClient invalide', 400);
      }
      filter.idClient = clientId;
    }

    if (idProd != null && idProd !== '') {
      const produitId = parseInt(idProd, 10);
      if (!Number.isInteger(produitId) || produitId <= 0) {
        throw new AppError('idProd invalide', 400);
      }
      filter.idProd = produitId;
    }

    const total = await ProduitFavori.countDocuments(filter);
    const rows = await ProduitFavori.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ date: -1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeFavori(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getProduitFavori(idClient, idProd) {
    const favoris = await ProduitFavori.findOne({
      idClient,
      idProd
    }).lean();

    if (!favoris) {
      throw new AppError('Produit favori introuvable', 404);
    }

    return serializeFavori(favoris);
  },

  async updateProduitFavori(idClient, idProd, data) {
    const favori = await ProduitFavori.findOne({ idClient, idProd });
    if (!favori) {
      throw new AppError('Produit favori introuvable', 404);
    }

    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (Number.isNaN(parsedDate.valueOf())) {
        throw new AppError('date invalide', 400);
      }
      favori.date = parsedDate;
    }

    await favori.save();
    return serializeFavori(favori);
  },

  async deleteProduitFavori(idClient, idProd) {
    const favori = await ProduitFavori.findOne({ idClient, idProd });
    if (!favori) {
      throw new AppError('Produit favori introuvable', 404);
    }

    await ProduitFavori.deleteOne({ idClient, idProd });
    return { message: 'Favori supprimé avec succès' };
  }
};

module.exports = ProduitFavoriService;
