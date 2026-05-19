const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by username or fullName
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Users found
 */
router.get('/search', protect, userController.searchUsers);

/**
 * @swagger
 * /users/suggested:
 *   get:
 *     summary: Get suggested users to follow
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suggested users retrieved
 */
router.get('/suggested', protect, userController.suggestedUsers);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 160
 *               website:
 *                 type: string
 *                 format: uri
 *               avatar:
 *                 type: string
 *                 format: uri
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch(
  '/me',
  [
    protect,
    body('fullName').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Full name must be 2-80 characters.'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 24 })
      .withMessage('Username must be 3-24 characters.')
      .matches(/^[a-z0-9_.]+$/)
      .withMessage('Username can contain letters, numbers, underscores, and dots.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid.').normalizeEmail(),
    body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 7, max: 20 }).withMessage('Mobile number is invalid.'),
    body('bio').optional().trim().isLength({ max: 160 }).withMessage('Bio must be 160 characters or less.'),
    body('website').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Website URL is invalid.'),
    body('avatar').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Avatar URL is invalid.'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false.'),
  ],
  validate,
  userController.updateMe
);
/**
 * @swagger
 * /users/me/saved-posts:
 *   get:
 *     summary: Get current user's saved posts
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved posts retrieved successfully
 */
router.get('/me/saved-posts', protect, userController.getSavedPosts);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user's account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete('/me', protect, userController.deleteMe);

/**
 * @swagger
 * /users/{id}/block:
 *   post:
 *     summary: Block a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 */
router.post('/:id/block', protect, userController.blockUser);

/**
 * @swagger
 * /users/{id}/unblock:
 *   post:
 *     summary: Unblock a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 */
router.post('/:id/unblock', protect, userController.unblockUser);

/**
 * @swagger
 * /users/{idOrUsername}/posts:
 *   get:
 *     summary: Get user's posts
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrUsername
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or username
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 */
router.get('/:idOrUsername/posts', protect, userController.getUserPosts);

/**
 * @swagger
 * /users/{idOrUsername}/followers:
 *   get:
 *     summary: Get user's followers
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrUsername
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or username
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
 */
router.get('/:idOrUsername/followers', protect, userController.getFollowers);

/**
 * @swagger
 * /users/{idOrUsername}/following:
 *   get:
 *     summary: Get user's following list
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrUsername
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or username
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 */
router.get('/:idOrUsername/following', protect, userController.getFollowing);

/**
 * @swagger
 * /users/{idOrUsername}:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idOrUsername
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or username
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get('/:idOrUsername', protect, userController.getProfile);

module.exports = router;
