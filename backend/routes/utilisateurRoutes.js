const express = require('express');
const utilisateurController = require('../controllers/utilisateurController');
const { protect } = require('../middleware/authMiddleware');
const AppError = require('../middleware/AppError');
const { parseId } = require('../utils/validators');

const router = express.Router();

function assertSelfOrAdmin(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return next(new AppError('ID invalide', 400));
  }
  if (req.user.role === 'admin' || req.user.idUtilisateur === id) {
    return next();
  }
  return next(new AppError('Accès refusé.', 403));
}

router.post('/', utilisateurController.ajouterUtilisateur);
router.get('/', utilisateurController.listerUtilisateurs);
router.get('/:id', utilisateurController.getUtilisateur);
router.put('/:id', protect, assertSelfOrAdmin, utilisateurController.modifierUtilisateur);
router.delete('/:id', utilisateurController.supprimerUtilisateur);

module.exports = router;
