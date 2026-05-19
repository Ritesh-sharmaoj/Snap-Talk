const express = require('express');
const followController = require('../controllers/follow.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Follow
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *   delete:
 *     summary: Unfollow a user
 *     tags:
 *       - Follow
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 */
router.post('/:userId', protect, followController.followUser);
router.delete('/:userId', protect, followController.unfollowUser);

module.exports = router;
