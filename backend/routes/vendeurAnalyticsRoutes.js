const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const vendeurAnalyticsController = require('../controllers/vendeurAnalyticsController');

const router = express.Router();

router.use(protect, restrictTo('vendeur'));
router.get('/predictions-ventes', vendeurAnalyticsController.getPredictionsVentes);

module.exports = router;
