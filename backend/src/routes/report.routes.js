const express = require('express');
const { body } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get reports created by the current user
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *   post:
 *     summary: Create a new report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - reason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [Post, Reel, Story, Comment, User, Message]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [spam, harassment, nudity, violence, hate, scam, other]
 *               details:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Report created successfully
 */
router.get('/', protect, reportController.getMyReports);

/**
 * @swagger
 * /reports/{reportId}:
 *   get:
 *     summary: Get a single report by ID
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 */
router.get('/:reportId', protect, reportController.getReport);
router.post(
  '/',
  [
    protect,
    body('targetType').isIn(['Post', 'Reel', 'Story', 'Comment', 'User', 'Message']).withMessage('Invalid targetType.'),
    body('targetId').notEmpty().withMessage('targetId is required.'),
    body('reason').isIn(['spam', 'harassment', 'nudity', 'violence', 'hate', 'scam', 'other']).withMessage('Invalid reason.'),
    body('details').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('Details are too long.'),
  ],
  validate,
  reportController.createReport
);

module.exports = router;
