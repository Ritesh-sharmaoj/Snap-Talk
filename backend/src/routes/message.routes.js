const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/conversations', protect, messageController.getConversations);
router.get('/:userId', protect, messageController.getThread);
router.post(
  '/',
  [
    protect,
    body('recipientId').notEmpty().withMessage('recipientId is required.'),
    body('type').optional().isIn(['text', 'image']).withMessage('type must be text or image.'),
    body('text').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Message is too long.'),
    body('mediaUrl').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('mediaUrl is invalid.'),
  ],
  validate,
  messageController.sendMessage
);
router.patch('/:userId/seen', protect, messageController.markSeen);

module.exports = router;
