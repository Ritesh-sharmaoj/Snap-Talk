const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/security');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - fullName
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 24
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 80
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *                 minLength: 7
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post(
  '/signup',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 24 }).withMessage('Username must be 3-24 characters.'),
    body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Full name is required.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email is invalid.').normalizeEmail(),
    body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 7 }).withMessage('Mobile number is invalid.'),
    body('password')
      .isLength({ min: 8, max: 72 })
      .withMessage('Password must be 8-72 characters.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage('Password must include upper, lower, and a number.'),
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, mobile, or username
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Email, mobile, or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional refresh token to revoke.
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', protect, authController.logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 */
router.post(
  '/refresh-token',
  authLimiter,
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.')],
  validate,
  authController.refreshToken
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, mobile, or username
 *     responses:
 *       200:
 *         description: Reset token sent
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  [body('identifier').trim().notEmpty().withMessage('Email, mobile, or username is required.')],
  validate,
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  [
    body('token').trim().notEmpty().withMessage('Reset token is required.'),
    body('password')
      .isLength({ min: 8, max: 72 })
      .withMessage('Password must be 8-72 characters.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage('Password must include upper, lower, and a number.'),
  ],
  validate,
  authController.resetPassword
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /auth/setup-profile:
 *   patch:
 *     summary: Setup user profile after signup
 *     tags:
 *       - Authentication
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
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               website:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile setup completed
 */
router.patch(
  '/setup-profile',
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
    body('bio').optional().trim().isLength({ max: 160 }).withMessage('Bio must be 160 characters or less.'),
    body('website').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Website URL is invalid.'),
    body('avatar').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Avatar URL is invalid.'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false.'),
  ],
  validate,
  authController.setupProfile
);
/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch(
  '/change-password',
  [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8, max: 72 })
      .withMessage('New password must be 8-72 characters.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage('New password must include upper, lower, and a number.'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
