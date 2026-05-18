const express = require('express');
const likeController = require('../controllers/like.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/posts/:postId', protect, likeController.likePost);
router.post('/reels/:reelId', protect, likeController.likeReel);
router.post('/comments/:commentId', protect, likeController.likeComment);

module.exports = router;
