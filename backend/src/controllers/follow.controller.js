const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createNotification = require('../utils/createNotification');
const User = require('../models/User');

const followUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);

  if (!target || target.isDeleted) {
    throw new ApiError(404, 'User not found.');
  }

  if (target._id.equals(req.user._id)) {
    throw new ApiError(422, 'You cannot follow yourself.');
  }

  if (!req.user.following.some((id) => id.equals(target._id))) {
    req.user.following.push(target._id);
    target.followers.push(req.user._id);
    await Promise.all([req.user.save(), target.save()]);

    await createNotification({
      recipient: target._id,
      actor: req.user._id,
      type: 'follow',
      entityType: 'User',
      entity: req.user._id,
      text: `${req.user.username} started following you.`,
    });
  }

  res.json({
    success: true,
    message: 'User followed.',
    data: {
      following: true,
      followersCount: target.followers.length,
    },
  });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);

  if (!target) {
    throw new ApiError(404, 'User not found.');
  }

  req.user.following = req.user.following.filter((id) => !id.equals(target._id));
  target.followers = target.followers.filter((id) => !id.equals(req.user._id));
  await Promise.all([req.user.save(), target.save()]);

  res.json({
    success: true,
    message: 'User unfollowed.',
    data: {
      following: false,
      followersCount: target.followers.length,
    },
  });
});

module.exports = {
  followUser,
  unfollowUser,
};
