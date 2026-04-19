const express = require('express');
const stockController = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, stockController.listerStocks);
router.post('/', protect, stockController.creerStock);
router.get('/:id', protect, stockController.getStock);

module.exports = router;
