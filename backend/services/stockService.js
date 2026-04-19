const { Stock, Produit, Stocker, nextId } = require('../models');
const AppError = require('../middleware/AppError');

async function serializeStock(stockDoc) {
  const s = stockDoc.toObject ? stockDoc.toObject() : { ...stockDoc };
  const links = await Stocker.find({ idStock: s.idStock }).lean();
  const idProds = links.map((l) => l.idProd);
  const Produits = idProds.map((idProd) => ({ idProd }));
  return { ...s, Produits };
}

const StockService = {
  async createStock(data) {
    const { adresse } = data;
    if (!adresse || !String(adresse).trim()) {
      throw new AppError('Adresse du stock requise', 400);
    }

    const idStock = await nextId('stock');
    const newStock = await Stock.create({ idStock, adresse: String(adresse).trim() });
    return serializeStock(newStock);
  },

  async getStocks(filters = {}) {
    const page = Number.isInteger(Number(filters.page)) && Number(filters.page) > 0 ? parseInt(filters.page, 10) : 1;
    const limit = Number.isInteger(Number(filters.limit)) && Number(filters.limit) > 0 ? parseInt(filters.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const total = await Stock.countDocuments({});
    const rows = await Stock.find().skip(offset).limit(limit).sort({ idStock: -1 }).lean();

    const data = await Promise.all(rows.map((r) => serializeStock(r)));

    return {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data
    };
  },

  async getStockById(id) {
    const stock = await Stock.findOne({ idStock: id });
    if (!stock) {
      throw new AppError('Stock introuvable', 404);
    }
    return serializeStock(stock);
  }
};

module.exports = StockService;
