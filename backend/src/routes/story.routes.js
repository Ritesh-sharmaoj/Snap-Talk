const express = require('express');
const { body } = require('express-validator');
const storyController = require('../controllers/story.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', protect, storyController.getActiveStories);
router.post(
  '/',
  [
    protect,
    body('mediaUrl').isURL({ require_protocol: true }).withMessage('A valid mediaUrl is required.'),
    body('mediaType').optional().isIn(['image', 'video']).withMessage('mediaType must be image or video.'),
    body('caption').optional({ checkFalsy: true }).isLength({ max: 240 }).withMessage('Caption is too long.'),
  ],
  validate,
  storyController.createStory
);
router.get('/:storyId', protect, storyController.viewStory);
router.get('/:storyId/viewers', protect, storyController.getStoryViewers);
router.delete('/:storyId', protect, storyController.deleteStory);

module.exports = router;
