const express = require('express');
const commentaireController = require('../controllers/commentaireController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', commentaireController.listerCommentaires);
router.get('/:id', commentaireController.getCommentaire);
router.post('/', protect, commentaireController.creerCommentaire);
router.put('/:id', protect, commentaireController.modifierCommentaire);
router.delete('/:id', protect, commentaireController.supprimerCommentaire);

module.exports = router;
