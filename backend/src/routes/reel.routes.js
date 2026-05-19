const express = require('express');
const { body } = require('express-validator');
const reelController = require('../controllers/reel.controller');
const { protect } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/security');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /reels:
 *   get:
 *     summary: Get vertical short-video feed
 *     tags:
 *       - Reels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reels retrieved successfully
 *   post:
 *     summary: Create a new reel
 *     tags:
 *       - Reels
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoUrl
 *             properties:
 *               videoUrl:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               caption:
 *                 type: string
 *                 maxLength: 1200
 *               audioTitle:
 *                 type: string
 *                 maxLength: 120
 *     responses:
 *       201:
 *         description: Reel created successfully
 */
router.get('/', protect, reelController.getReels);
router.post(
  '/',
  [
    protect,
    body('videoUrl').isURL({ require_protocol: true }).withMessage('A valid videoUrl is required.'),
    body('caption').optional({ checkFalsy: true }).isLength({ max: 1200 }).withMessage('Caption is too long.'),
    body('audioTitle').optional({ checkFalsy: true }).isLength({ max: 120 }).withMessage('Audio title is too long.'),
  ],
  validate,
  reelController.createReel
);

/**
 * @swagger
 * /reels/{reelId}:
 *   get:
 *     summary: Get a single reel
 *     tags:
 *       - Reels
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
 *         description: Reel retrieved successfully
 *   delete:
 *     summary: Delete a reel
 *     tags:
 *       - Reels
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
 *         description: Reel deleted successfully
 */
router.get('/:reelId', protect, reelController.getReel);

/**
 * @swagger
 * /reels/{reelId}/share:
 *   post:
 *     summary: Track reel share
 *     tags:
 *       - Reels
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
 *         description: Reel share tracked successfully
 */
router.post('/:reelId/share', protect, reelController.shareReel);
router.delete('/:reelId', protect, checkOwnership('Reel', 'reelId'), reelController.deleteReel);

module.exports = router;
