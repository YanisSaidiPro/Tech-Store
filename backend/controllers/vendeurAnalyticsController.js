const { predictTopProductsForVendeur } = require('../services/ventePredictionService');
const { parseNumber } = require('../utils/validators');

exports.getPredictionsVentes = async (req, res, next) => {
  try {
    const weeks = parseNumber(req.query.semaines, 16);
    const result = await predictTopProductsForVendeur(req.user.idUtilisateur, { weeks });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
