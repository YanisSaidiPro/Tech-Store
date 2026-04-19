const express = require('express');
const paiementController = require('../controllers/paiementController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, paiementController.creerPaiement);
router.get('/', protect, paiementController.listerPaiements);
router.get('/:id', protect, paiementController.getPaiement);
router.put('/:id', protect, paiementController.modifierPaiement);
router.delete('/:id', protect, paiementController.supprimerPaiement);

module.exports = router;
