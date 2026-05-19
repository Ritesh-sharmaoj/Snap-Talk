const express = require('express');
const { body } = require('express-validator');
const storyController = require('../controllers/story.controller');
const { protect } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/security');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get active stories from self and following users
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
 *   post:
 *     summary: Create a new story
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaUrl
 *             properties:
 *               mediaUrl:
 *                 type: string
 *               mediaType:
 *                 type: string
 *                 enum: [image, video]
 *               caption:
 *                 type: string
 *                 maxLength: 240
 *     responses:
 *       201:
 *         description: Story created successfully
 */
router.get('/', protect, storyController.getActiveStories);
router.post(
  '/',
  [
    protect,
    body('mediaUrl').isURL({ require_protocol: true }).withMessage('A valid mediaUrl is required.'),
    body('mediaType').optional().isIn(['image', 'video']).withMessage('mediaType must be image or video.'),
    body('caption').optional({ checkFalsy: true }).isLength({ max: 240 }).withMessage('Caption is too long.'),
  ],
  validate,
  storyController.createStory
);

/**
 * @swagger
 * /stories/{storyId}:
 *   get:
 *     summary: View a story
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story retrieved successfully
 *   delete:
 *     summary: Delete a story
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story deleted successfully
 */
router.get('/:storyId', protect, storyController.viewStory);

/**
 * @swagger
 * /stories/{storyId}/viewers:
 *   get:
 *     summary: Get list of users who viewed the story
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story viewers retrieved successfully
 */
router.get('/:storyId/viewers', protect, storyController.getStoryViewers);
router.delete('/:storyId', protect, checkOwnership('Story', 'storyId'), storyController.deleteStory);

module.exports = router;
