const {
  Panier,
  Contient,
  Produit,
  ProduitImage,
  Utilisateur,
  Categorie,
  nextId
} = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function serializePanier(panierRaw) {
  const panier = panierRaw.toObject ? panierRaw.toObject() : { ...panierRaw };
  const u = await Utilisateur.findOne({ idUtilisateur: panier.idClient })
    .select('idUtilisateur nom email')
    .lean();
  const contients = await Contient.find({ idPanier: panier.idPanier }).lean();
  const Produits = [];
  for (const c of contients) {
    const p = await Produit.findOne({ idProd: c.idProd }).lean();
    if (!p) continue;
    const [cat, mainImg] = await Promise.all([
      Categorie.findOne({ idCategorie: p.idCategorie }).select('idCategorie nomCat').lean(),
      ProduitImage.findOne({ idProd: p.idProd }).sort({ isMain: -1, ordre: 1 }).select('url').lean()
    ]);
    Produits.push({
      ...p,
      Categorie: cat || null,
      imagePrincipale: mainImg?.url || null,
      Contient: { qte: c.qte, unite: c.unite }
    });
  }
  return {
    ...panier,
    Client: {
      idClient: panier.idClient,
      Utilisateur: u
        ? { idUtilisateur: u.idUtilisateur, nom: u.nom, email: u.email }
        : null
    },
    Produits
  };
}

const PanierService = {
  async createPanier(data) {
    const { idClient, statut, dateExpiration } = data;

    if (idClient == null) {
      throw new AppError('idClient est requis', 400);
    }

    const idPanier = await nextId('panier');
    const newPanier = {
      idPanier,
      idClient,
      statut: statut ? String(statut).trim() : 'actif'
    };

    if (dateExpiration !== undefined) {
      const date = new Date(dateExpiration);
      if (Number.isNaN(date.valueOf())) {
        throw new AppError('dateExpiration invalide', 400);
      }
      newPanier.dateExpiration = date;
    }

    const panier = await Panier.create(newPanier);
    return serializePanier(panier);
  },

  async getPaniers(filters = {}) {
    const { page = 1, limit = 10, search, idClient, statut } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idClient != null) {
      filter.idClient = idClient;
    }
    if (statut) {
      filter.statut = statut;
    }
    if (search) {
      filter.statut = { $regex: escapeRegex(search), $options: 'i' };
    }

    const total = await Panier.countDocuments(filter);
    const rows = await Panier.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ dateCreation: -1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializePanier(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getPanierById(id) {
    const panier = await Panier.findOne({ idPanier: id });

    if (!panier) {
      throw new AppError('Panier non trouvé', 404);
    }

    return serializePanier(panier);
  },

  async updatePanier(id, data) {
    const panier = await Panier.findOne({ idPanier: id });
    if (!panier) {
      throw new AppError('Panier non trouvé', 404);
    }

    if (data.statut !== undefined) {
      panier.statut = String(data.statut).trim();
    }

    if (data.dateExpiration !== undefined) {
      const date = new Date(data.dateExpiration);
      if (Number.isNaN(date.valueOf())) {
        throw new AppError('dateExpiration invalide', 400);
      }
      panier.dateExpiration = date;
    }

    await panier.save();
    return serializePanier(panier);
  },

  async deletePanier(id) {
    const panier = await Panier.findOne({ idPanier: id });
    if (!panier) {
      throw new AppError('Panier non trouvé', 404);
    }

    await Contient.deleteMany({ idPanier: id });
    await Panier.deleteOne({ idPanier: id });
    return { message: 'Panier supprimé avec succès' };
  }
};

module.exports = PanierService;
