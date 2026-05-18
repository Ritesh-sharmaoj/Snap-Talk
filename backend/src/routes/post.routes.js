const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/feed', protect, postController.getFeed);
router.get('/explore', protect, postController.getExplore);
router.get('/hashtag/:tag', protect, postController.getPostsByHashtag);
router.post(
  '/',
  [
    protect,
    body('mediaUrl').isURL({ require_protocol: true }).withMessage('A valid mediaUrl is required.'),
    body('mediaType').optional().isIn(['image', 'video']).withMessage('mediaType must be image or video.'),
    body('caption').optional({ checkFalsy: true }).isLength({ max: 2200 }).withMessage('Caption is too long.'),
  ],
  validate,
  postController.createPost
);
router.get('/:postId', protect, postController.getPost);
router.post('/:postId/save', protect, postController.savePost);
router.post('/:postId/share', protect, postController.sharePost);
router.delete('/:postId', protect, postController.deletePost);

module.exports = router;
