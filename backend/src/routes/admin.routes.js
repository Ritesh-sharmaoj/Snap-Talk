const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Admin email, mobile, or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  adminController.adminLogin
);

router.use(protect, requireAdmin);

router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:userId/block', adminController.toggleBlockUser);
router.get('/reports', adminController.listReports);
router.patch('/reports/:reportId', adminController.updateReport);
router.delete('/posts/:postId', adminController.deleteReportedPost);

module.exports = router;
