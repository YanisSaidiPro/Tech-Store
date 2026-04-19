const express = require('express');
const vendeurController = require('../controllers/vendeurController');
const router = express.Router();

router.post('/', vendeurController.ajouterVendeur);
router.get('/', vendeurController.listerVendeurs);
router.get('/:id', vendeurController.getVendeur);
router.put('/:id', vendeurController.modifierVendeur);
router.delete('/:id', vendeurController.supprimerVendeur);

module.exports = router;
