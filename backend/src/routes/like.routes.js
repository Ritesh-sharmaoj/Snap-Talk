const express = require('express');
const likeController = require('../controllers/like.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /likes/posts/{postId}:
 *   post:
 *     summary: Like/unlike a post
 *     tags:
 *       - Likes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 * /likes/reels/{reelId}:
 *   post:
 *     summary: Like/unlike a reel
 *     tags:
 *       - Likes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reel liked/unliked successfully
 * /likes/comments/{commentId}:
 *   post:
 *     summary: Like/unlike a comment
 *     tags:
 *       - Likes
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
 *         description: Comment liked/unliked successfully
 * /likes/{type}/{id}:
 *   get:
 *     summary: Get list of users who liked a target
 *     tags:
 *       - Likes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Reel, Comment]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes retrieved successfully
 */
router.post('/posts/:postId', protect, likeController.likePost);
router.post('/reels/:reelId', protect, likeController.likeReel);
router.post('/comments/:commentId', protect, likeController.likeComment);

router.get('/:type/:id', protect, likeController.getLikes);

module.exports = router;
