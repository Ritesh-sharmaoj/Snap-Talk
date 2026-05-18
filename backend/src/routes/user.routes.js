const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, userController.searchUsers);
router.get('/suggested', protect, userController.suggestedUsers);
router.patch('/me', protect, userController.updateMe);
router.delete('/me', protect, userController.deleteMe);
router.get('/:idOrUsername/posts', protect, userController.getUserPosts);
router.get('/:idOrUsername/followers', protect, userController.getFollowers);
router.get('/:idOrUsername/following', protect, userController.getFollowing);
router.get('/:idOrUsername', protect, userController.getProfile);

module.exports = router;
