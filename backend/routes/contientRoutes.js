const express = require('express');
const contientController = require('../controllers/contientController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, contientController.creerContient);
router.get('/', protect, contientController.listerContients);
router.get('/:idPanier/:idProd', protect, contientController.getContient);
router.put('/:idPanier/:idProd', protect, contientController.modifierContient);
router.delete('/:idPanier/:idProd', protect, contientController.supprimerContient);

module.exports = router;
