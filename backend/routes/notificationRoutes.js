const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/unread-count', protect, notificationController.compterNonLues);
router.patch('/read-all', protect, notificationController.marquerToutesLues);
router.get('/', protect, notificationController.listerNotifications);
router.patch('/:id', protect, notificationController.marquerLue);

module.exports = router;
