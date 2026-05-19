const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/security');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     summary: List replies for a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *   post:
 *     summary: Add a reply to a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Reply added successfully
 */
router.get('/:commentId/replies', protect, commentController.listReplies);
router.post(
  '/:commentId/replies',
  [
    protect,
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Reply must be 1-500 characters.'),
  ],
  validate,
  commentController.addReply
);

/**
 * @swagger
 * /comments/{targetType}/{targetId}:
 *   get:
 *     summary: List comments for a post or reel
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Reel]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *   post:
 *     summary: Add a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Reel]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.get('/:targetType/:targetId', protect, commentController.listComments);
router.post(
  '/:targetType/:targetId',
  [
    protect,
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters.'),
  ],
  validate,
  commentController.addComment
);

/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     summary: Edit a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Comment edited successfully
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.patch(
  '/:commentId',
  [
    protect,
    checkOwnership('Comment', 'commentId'),
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters.'),
  ],
  validate,
  commentController.editComment
);

router.delete('/:commentId', protect, checkOwnership('Comment', 'commentId'), commentController.deleteComment);

module.exports = router;
