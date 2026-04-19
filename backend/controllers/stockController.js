const stockService = require('../services/stockService');
const AppError = require('../middleware/AppError');

exports.creerStock = async (req, res, next) => {
  try {
    const stock = await stockService.createStock(req.body);
    res.status(201).json(stock);
  } catch (err) {
    next(err);
  }
};

exports.listerStocks = async (req, res, next) => {
  try {
    const result = await stockService.getStocks({
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getStock = async (req, res, next) => {
  try {
    const idStock = parseInt(req.params.id, 10);
    if (!Number.isInteger(idStock) || idStock <= 0) {
      throw new AppError('ID de stock invalide', 400);
    }
    const stock = await stockService.getStockById(idStock);
    res.json(stock);
  } catch (err) {
    next(err);
  }
};
