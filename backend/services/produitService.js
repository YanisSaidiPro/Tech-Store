const { Produit, Categorie, Utilisateur, nextId } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function attachIncludes(produitLean) {
  if (!produitLean) return produitLean;
  const [cat, vendeurDoc] = await Promise.all([
    produitLean.idCategorie != null
      ? Categorie.findOne({ idCategorie: produitLean.idCategorie }).select('idCategorie nomCat').lean()
      : null,
    produitLean.idVendeur != null
      ? Utilisateur.findOne({ idUtilisateur: produitLean.idVendeur })
          .select('idUtilisateur nom prenom')
          .lean()
      : null
  ]);
  return {
    ...produitLean,
    Categorie: cat || null,
    Vendeur: vendeurDoc
      ? {
          idUtilisateur: vendeurDoc.idUtilisateur,
          nom: vendeurDoc.nom,
          prenom: vendeurDoc.prenom
        }
      : produitLean.idVendeur != null
        ? { idUtilisateur: produitLean.idVendeur }
        : null
  };
}

const ProduitService = {
  async createProduit(data) {
    const { nomProd, prix, description, idCategorie, categorie, idVendeur } = data;
    const resolvedCategorie = idCategorie ?? categorie;

    if (nomProd == null || nomProd === '' || prix == null || resolvedCategorie == null || idVendeur == null) {
      throw new AppError('Champs obligatoires manquants: nomProd, prix, idCategorie, idVendeur', 400);
    }

    const prixNumber = parseFloat(prix);
    if (Number.isNaN(prixNumber) || prixNumber < 0) {
      throw new AppError('Le prix doit être un nombre positif ou nul', 400);
    }

    const idProd = await nextId('produit');
    const produit = await Produit.create({
      idProd,
      nomProd,
      prix: prixNumber,
      description,
      idCategorie: resolvedCategorie,
      idVendeur
    });

    return attachIncludes(produit.toObject());
  },

  async getProduits(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      idCategorie,
      categorie,
      minPrix,
      maxPrix,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;
    const resolvedCategorie = idCategorie ?? categorie;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (search) {
      filter.nomProd = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (resolvedCategorie != null) {
      filter.idCategorie = resolvedCategorie;
    }

    if (minPrix != null) {
      filter.prix = { ...filter.prix, $gte: parseFloat(minPrix) };
    }
    if (maxPrix != null) {
      filter.prix = { ...filter.prix, $lte: parseFloat(maxPrix) };
    }

    const sortField = ['createdAt', 'prix', 'nomProd'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDir, idProd: -1 };

    const total = await Produit.countDocuments(filter);
    const rowsRaw = await Produit.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort(sort)
      .lean();

    const data = await Promise.all(rowsRaw.map((p) => attachIncludes(p)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getProduitById(id) {
    const produit = await Produit.findOne({ idProd: id }).lean();

    if (!produit) {
      throw new AppError('Produit non trouvé', 404);
    }

    return attachIncludes(produit);
  },

  async updateProduit(id, data) {
    const produit = await Produit.findOne({ idProd: id });

    if (!produit) {
      throw new AppError('Produit non trouvé', 404);
    }

    if (data.prix !== undefined) {
      const prixNumber = parseFloat(data.prix);
      if (Number.isNaN(prixNumber) || prixNumber < 0) {
        throw new AppError('Le prix doit être un nombre positif ou nul', 400);
      }
      produit.prix = prixNumber;
    }
    if (data.nomProd !== undefined) produit.nomProd = data.nomProd;
    if (data.description !== undefined) produit.description = data.description;
    if (data.idCategorie !== undefined) produit.idCategorie = data.idCategorie;
    if (data.idVendeur !== undefined) produit.idVendeur = data.idVendeur;

    await produit.save();
    return attachIncludes(produit.toObject());
  },

  async deleteProduit(id) {
    const produit = await Produit.findOne({ idProd: id });

    if (!produit) {
      throw new AppError('Produit non trouvé', 404);
    }

    await Produit.deleteOne({ idProd: id });
    return { message: 'Produit supprimé avec succès' };
  },

  async getTrendingProduits(limit = 10) {
    const rowsRaw = await Produit.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 10)
      .lean();
    return Promise.all(rowsRaw.map((p) => attachIncludes(p)));
  }
};

module.exports = ProduitService;
