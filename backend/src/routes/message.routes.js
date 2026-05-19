const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: List chat conversations
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get('/conversations', protect, messageController.getConversations);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get message thread with a user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message thread retrieved successfully
 */
router.get('/:userId', protect, messageController.getThread);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image]
 *               text:
 *                 type: string
 *                 maxLength: 2000
 *               mediaUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
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

/**
 * @swagger
 * /messages/{userId}/seen:
 *   patch:
 *     summary: Mark conversation as seen
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation marked as seen successfully
 */
router.patch('/:userId/seen', protect, messageController.markSeen);

module.exports = router;
