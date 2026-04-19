const express = require('express');
const produitImageController = require('../controllers/produitImageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', produitImageController.listerProduitImages);
router.get('/:id', produitImageController.getProduitImage);
router.post('/', protect, produitImageController.creerProduitImage);
router.put('/:id', protect, produitImageController.modifierProduitImage);
router.delete('/:id', protect, produitImageController.supprimerProduitImage);

module.exports = router;
