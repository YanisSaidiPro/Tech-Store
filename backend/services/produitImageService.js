const { ProduitImage, Produit, nextId } = require('../models');
const AppError = require('../middleware/AppError');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function serializeImage(img) {
  const raw = img.toObject ? img.toObject() : { ...img };
  const produit = await Produit.findOne({ idProd: raw.idProd }).select('idProd nomProd prix').lean();
  return { ...raw, Produit: produit };
}

const ProduitImageService = {
  async createProduitImage(data) {
    const { url, idProd, isMain, ordre } = data;
    if (!url || idProd == null) {
      throw new AppError('url et idProd sont requis', 400);
    }

    const parsedOrder = ordre !== undefined ? parseInt(ordre, 10) : 0;
    const idImage = await nextId('produitImage');
    const image = await ProduitImage.create({
      idImage,
      url: String(url).trim(),
      idProd,
      isMain: isMain !== undefined ? Boolean(isMain) : false,
      ordre: Number.isNaN(parsedOrder) ? 0 : parsedOrder
    });

    return serializeImage(image);
  },

  async getProduitImages(filters = {}) {
    const { page = 1, limit = 10, search, idProd, isMain } = filters;
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = {};

    if (idProd != null) {
      filter.idProd = idProd;
    }
    if (isMain !== undefined) {
      filter.isMain = isMain === 'true' || isMain === true;
    }
    if (search) {
      filter.url = { $regex: escapeRegex(search), $options: 'i' };
    }

    const total = await ProduitImage.countDocuments(filter);
    const rows = await ProduitImage.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ ordre: 1 })
      .lean();

    const data = await Promise.all(rows.map((r) => serializeImage(r)));

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data
    };
  },

  async getProduitImageById(id) {
    const image = await ProduitImage.findOne({ idImage: id });

    if (!image) {
      throw new AppError('ProduitImage non trouvée', 404);
    }

    return serializeImage(image);
  },

  async updateProduitImage(id, data) {
    const image = await ProduitImage.findOne({ idImage: id });
    if (!image) {
      throw new AppError('ProduitImage non trouvée', 404);
    }

    if (data.url !== undefined) {
      if (!data.url) {
        throw new AppError('url ne peut pas être vide', 400);
      }
      image.url = String(data.url).trim();
    }
    if (data.idProd !== undefined) {
      image.idProd = data.idProd;
    }
    if (data.isMain !== undefined) {
      image.isMain = data.isMain === 'true' || data.isMain === true;
    }
    if (data.ordre !== undefined) {
      const parsedOrder = Number(data.ordre);
      if (Number.isNaN(parsedOrder)) {
        throw new AppError('ordre invalide', 400);
      }
      image.ordre = parsedOrder;
    }

    await image.save();
    return serializeImage(image);
  },

  async deleteProduitImage(id) {
    const image = await ProduitImage.findOne({ idImage: id });
    if (!image) {
      throw new AppError('ProduitImage non trouvée', 404);
    }

    await ProduitImage.deleteOne({ idImage: id });
    return { message: 'ProduitImage supprimée avec succès' };
  }
};

module.exports = ProduitImageService;
