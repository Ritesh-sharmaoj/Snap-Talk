const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, notificationController.getNotifications);
router.patch('/read-all', protect, notificationController.markAllRead);
router.patch('/:notificationId/read', protect, notificationController.markRead);

module.exports = router;
