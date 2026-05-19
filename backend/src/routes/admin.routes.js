const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags:
 *       - Admin
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
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminAuthResponse'
 */
router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Admin email, mobile, or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  adminController.adminLogin
);

router.use(protect, requireAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', adminController.dashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 */
router.get('/users', adminController.listUsers);

/**
 * @swagger
 * /admin/users/{userId}/block:
 *   patch:
 *     summary: Toggle user block status (Admin)
 *     tags:
 *       - Admin
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
 *         description: User block status updated
 */
router.patch('/users/:userId/block', adminController.toggleBlockUser);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: List all reports (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports list retrieved successfully
 */
router.get('/reports', adminController.listReports);

/**
 * @swagger
 * /admin/reports/{reportId}:
 *   patch:
 *     summary: Update report status (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, reviewing, resolved, dismissed]
 *               moderatorNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated successfully
 */
router.patch('/reports/:reportId', adminController.updateReport);

/**
 * @swagger
 * /admin/content/{contentType}/{contentId}:
 *   delete:
 *     summary: Delete reported content (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Reel, Story, Comment]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content deleted successfully
 */
router.delete('/content/:contentType/:contentId', adminController.deleteContent);

module.exports = router;
