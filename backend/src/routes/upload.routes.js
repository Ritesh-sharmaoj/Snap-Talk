const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('media'), uploadController.uploadMedia);

module.exports = router;
