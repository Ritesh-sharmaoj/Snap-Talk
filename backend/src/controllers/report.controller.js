const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const Report = require('../models/Report');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Message = require('../models/Message');

const targetsWithReportCount = {
  Post,
  Reel,
  Story,
  Comment,
  User,
  Message,
};

const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details = '' } = req.body;

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    target: targetId,
    reason,
    details,
  });

  if (targetsWithReportCount[targetType]) {
    await targetsWithReportCount[targetType].findByIdAndUpdate(targetId, { $inc: { reportsCount: 1 } });
  }

  res.status(201).json({
    success: true,
    message: 'Report submitted.',
    data: report,
  });
});

const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: reports });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.reportId, reporter: req.user._id });

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  res.json({ success: true, data: report });
});

module.exports = {
  createReport,
  getMyReports,
  getReport,
};
