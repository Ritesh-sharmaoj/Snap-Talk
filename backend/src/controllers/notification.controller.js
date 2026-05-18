const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('actor', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  notification.read = true;
  await notification.save();

  res.json({ success: true, data: notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
