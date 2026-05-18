const express = require('express');
const followController = require('../controllers/follow.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:userId', protect, followController.followUser);
router.delete('/:userId', protect, followController.unfollowUser);

module.exports = router;
