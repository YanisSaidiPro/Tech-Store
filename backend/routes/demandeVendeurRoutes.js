const express = require('express');
const demandeVendeurController = require('../controllers/demandeVendeurController');
const router = express.Router();

router.post('/', demandeVendeurController.creerDemande);
router.get('/', demandeVendeurController.listerDemandes);
router.get('/:id', demandeVendeurController.getDemande);
router.put('/:id/accept', demandeVendeurController.accepterDemande);
router.put('/:id/reject', demandeVendeurController.refuserDemande);

module.exports = router;
            