const express = require('express');
const commandeController = require('../controllers/commandeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, commandeController.creerCommande);
router.get('/', protect, commandeController.listerCommandes);
router.get('/:id', protect, commandeController.getCommande);
router.put('/:id', protect, commandeController.modifierCommande);
router.delete('/:id', protect, commandeController.supprimerCommande);

module.exports = router;