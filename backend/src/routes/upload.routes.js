const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload an image or video to Cloudinary
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Image or video file to upload (max 10MB)
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post('/', protect, uploadLimiter, upload.single('media'), uploadController.uploadMedia);

module.exports = router;
