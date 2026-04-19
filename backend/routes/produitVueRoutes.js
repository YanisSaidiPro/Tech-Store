const express = require('express');
const produitVueController = require('../controllers/produitVueController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/',protect, produitVueController.ajouterProduitVue);
router.get('/',protect, produitVueController.listerProduitVues);
router.get('/:id',protect,produitVueController.getProduitVue);
router.put('/:id',protect,produitVueController.modifierProduitVue);
router.delete('/:id',protect,produitVueController.supprimerProduitVue);

module.exports = router;
