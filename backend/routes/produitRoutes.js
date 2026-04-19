const express = require('express');
const produitController = require('../controllers/produitController');
const router = express.Router();

router.post('/', produitController.ajouterProduit);
router.get('/', produitController.listerProduits);
router.get('/:id', produitController.getProduit);
router.put('/:id', produitController.modifierProduit);
router.delete('/:id', produitController.supprimerProduit);

module.exports = router;
