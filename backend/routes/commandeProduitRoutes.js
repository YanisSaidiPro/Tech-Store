const express = require('express');
const commandeProduitController = require('../controllers/commandeProduitController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, commandeProduitController.creerCommandeProduit);
router.get('/', protect, commandeProduitController.listerCommandeProduits);
router.get('/:idCommande/:idProd', protect, commandeProduitController.getCommandeProduit);
router.put('/:idCommande/:idProd', protect, commandeProduitController.modifierCommandeProduit);
router.delete('/:idCommande/:idProd', protect, commandeProduitController.supprimerCommandeProduit);

module.exports = router;
