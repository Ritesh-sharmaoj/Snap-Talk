const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /posts/feed:
 *   get:
 *     summary: Get user feed with posts from following
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 */
router.get('/feed', protect, postController.getFeed);

/**
 * @swagger
 * /posts/explore:
 *   get:
 *     summary: Get explore page with trending posts
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Explore posts retrieved successfully
 */
router.get('/explore', protect, postController.getExplore);

/**
 * @swagger
 * /posts/hashtag/{tag}:
 *   get:
 *     summary: Get posts by hashtag
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Hashtag to search
 *     responses:
 *       200:
 *         description: Posts with hashtag retrieved
 */
router.get('/hashtag/:tag', protect, postController.getPostsByHashtag);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
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
 *                 description: URL of image or video
 *               mediaType:
 *                 type: string
 *                 enum: [image, video]
 *               caption:
 *                 type: string
 *                 maxLength: 2200
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post(
  '/',
  [
    protect,
    body('mediaUrl').isURL({ require_protocol: true }).withMessage('A valid mediaUrl is required.'),
    body('mediaType').optional().isIn(['image', 'video']).withMessage('mediaType must be image or video.'),
    body('caption').optional({ checkFalsy: true }).isLength({ max: 2200 }).withMessage('Caption is too long.'),
  ],
  validate,
  postController.createPost
);

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a single post by ID
 *     tags:
 *       - Posts
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
 *         description: Post retrieved successfully
 */
router.get('/:postId', protect, postController.getPost);

/**
 * @swagger
 * /posts/{postId}/save:
 *   post:
 *     summary: Save a post to bookmarks
 *     tags:
 *       - Posts
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
 *         description: Post saved successfully
 */
router.post('/:postId/save', protect, postController.savePost);

/**
 * @swagger
 * /posts/{postId}/share:
 *   post:
 *     summary: Share a post via message
 *     tags:
 *       - Posts
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
 *         description: Post shared successfully
 */
router.post('/:postId/share', protect, postController.sharePost);

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *       - Posts
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
 *         description: Post deleted successfully
 */
router.delete('/:postId', protect, postController.deletePost);

module.exports = router;
