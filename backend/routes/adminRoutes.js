const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/', adminController.ajouterAdmin);
router.get('/', adminController.listerAdmins);
router.get('/:id', adminController.getAdmin);
router.put('/:id', adminController.modifierAdmin);
router.delete('/:id', adminController.supprimerAdmin);

module.exports = router;