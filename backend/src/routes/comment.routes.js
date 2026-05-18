const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/:targetType/:targetId', protect, commentController.listComments);
router.post(
  '/:targetType/:targetId',
  [protect, body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters.')],
  validate,
  commentController.addComment
);
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;
