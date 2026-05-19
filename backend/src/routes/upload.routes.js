const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, uploadLimiter, upload.single('media'), uploadController.uploadMedia);

module.exports = router;
