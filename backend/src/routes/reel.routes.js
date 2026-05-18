const express = require('express');
const { body } = require('express-validator');
const reelController = require('../controllers/reel.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

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
router.get('/:reelId', protect, reelController.getReel);
router.post('/:reelId/share', protect, reelController.shareReel);
router.delete('/:reelId', protect, reelController.deleteReel);

module.exports = router;
