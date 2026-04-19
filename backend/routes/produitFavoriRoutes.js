const express = require('express');
const produitFavoriController = require('../controllers/produitFavoriController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, produitFavoriController.listerProduitFavoris);
router.post('/', protect, produitFavoriController.ajouterProduitFavori);
router.get('/:idClient/:idProd', protect, produitFavoriController.getProduitFavori);
router.put('/:idClient/:idProd', protect, produitFavoriController.modifierProduitFavori);
router.delete('/:idClient/:idProd', protect, produitFavoriController.supprimerProduitFavori);

module.exports = router;
