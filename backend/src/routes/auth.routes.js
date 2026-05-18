const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3, max: 24 }).withMessage('Username must be 3-24 characters.'),
    body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Full name is required.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid.').normalizeEmail(),
    body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 7 }).withMessage('Mobile number is invalid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email, mobile, or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

router.post(
  '/forgot-password',
  [body('identifier').trim().notEmpty().withMessage('Email, mobile, or username is required.')],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty().withMessage('Reset token is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  authController.resetPassword
);

router.get('/me', protect, authController.getMe);
router.patch('/setup-profile', protect, authController.setupProfile);
router.patch(
  '/change-password',
  [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
