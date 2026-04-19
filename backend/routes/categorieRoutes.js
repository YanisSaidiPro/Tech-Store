const express = require('express');
const categorieController = require('../controllers/categorieController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/', protect, restrictTo('admin'), categorieController.ajouterCategorie);
router.get('/', categorieController.listerCategories);
router.get('/:id', categorieController.getCategorie);
router.put('/:id', protect, restrictTo('admin'), categorieController.modifierCategorie);
router.delete('/:id', protect, restrictTo('admin'), categorieController.supprimerCategorie);

module.exports = router;
