const { matchedData } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Report = require('../models/Report');

const adminLogin = asyncHandler(async (req, res) => {
  const { identifier, password } = matchedData(req);
  const normalized = String(identifier).trim().toLowerCase();
  const admin = await User.findOne({
    role: 'admin',
    $or: [{ email: normalized }, { username: normalized }, { mobile: identifier }],
  }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, 'Invalid admin credentials.');
  }

  res.json({
    success: true,
    message: 'Admin logged in.',
    data: {
      token: createToken(admin),
      user: admin,
    },
  });
});

const dashboard = asyncHandler(async (req, res) => {
  const [users, posts, reels, openReports, blockedUsers] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Post.countDocuments({ isDeleted: false }),
    Reel.countDocuments({ isDeleted: false }),
    Report.countDocuments({ status: { $in: ['open', 'reviewing'] } }),
    User.countDocuments({ isBlocked: true, isDeleted: false }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      posts,
      reels,
      openReports,
      blockedUsers,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(200)
    .select('username fullName email mobile avatar isBlocked isPrivate role createdAt');

  res.json({ success: true, data: users });
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.role === 'admin') {
    throw new ApiError(422, 'Admin accounts cannot be blocked here.');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: user.isBlocked ? 'User blocked.' : 'User unblocked.',
    data: user,
  });
});

const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ success: true, data: reports });
});

const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId);

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  if (req.body.status) {
    report.status = req.body.status;
  }

  if (req.body.moderatorNote !== undefined) {
    report.moderatorNote = req.body.moderatorNote;
  }

  await report.save();

  res.json({ success: true, message: 'Report updated.', data: report });
});

const deleteReportedPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  post.isDeleted = true;
  await post.save();

  res.json({ success: true, message: 'Reported post deleted.' });
});

module.exports = {
  adminLogin,
  dashboard,
  listUsers,
  toggleBlockUser,
  listReports,
  updateReport,
  deleteReportedPost,
};
