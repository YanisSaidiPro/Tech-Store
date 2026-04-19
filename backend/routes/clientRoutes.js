const express = require('express');
const clientController = require('../controllers/clientController');
const router = express.Router();

router.post('/', clientController.ajouterClient);
router.get('/', clientController.listerClients);
router.get('/:id', clientController.getClient);
router.put('/:id', clientController.modifierClient);
router.delete('/:id', clientController.supprimerClient);

module.exports = router;