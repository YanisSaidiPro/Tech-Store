const express = require('express');
const panierController = require('../controllers/panierController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/', protect, panierController.creerPanier);
router.get('/', protect, panierController.listerPaniers);
router.get('/:id', protect, panierController.getPanier);
router.put('/:id', protect, panierController.modifierPanier);
router.delete('/:id', protect, panierController.supprimerPanier);

module.exports = router;
