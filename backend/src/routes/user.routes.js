const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/search', protect, userController.searchUsers);
router.get('/suggested', protect, userController.suggestedUsers);
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
router.delete('/me', protect, userController.deleteMe);
router.get('/:idOrUsername/posts', protect, userController.getUserPosts);
router.get('/:idOrUsername/followers', protect, userController.getFollowers);
router.get('/:idOrUsername/following', protect, userController.getFollowing);
router.get('/:idOrUsername', protect, userController.getProfile);

module.exports = router;
