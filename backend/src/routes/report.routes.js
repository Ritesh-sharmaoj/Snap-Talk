const express = require('express');
const { body } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', protect, reportController.getMyReports);
router.get('/:reportId', protect, reportController.getReport);
router.post(
  '/',
  [
    protect,
    body('targetType').isIn(['Post', 'Reel', 'Story', 'Comment', 'User', 'Message']).withMessage('Invalid targetType.'),
    body('targetId').notEmpty().withMessage('targetId is required.'),
    body('reason').isIn(['spam', 'harassment', 'nudity', 'violence', 'hate', 'scam', 'other']).withMessage('Invalid reason.'),
    body('details').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('Details are too long.'),
  ],
  validate,
  reportController.createReport
);

module.exports = router;
