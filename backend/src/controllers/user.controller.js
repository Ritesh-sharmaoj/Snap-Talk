const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const Post = require('../models/Post');

const resolveUser = async (idOrUsername) => {
  if (mongoose.Types.ObjectId.isValid(idOrUsername)) {
    return User.findById(idOrUsername);
  }

  return User.findOne({ username: String(idOrUsername).toLowerCase() });
};

const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const users = await User.find({
    isDeleted: false,
    isBlocked: false,
    $or: [
      { username: new RegExp(q, 'i') },
      { fullName: new RegExp(q, 'i') },
    ],
  })
    .limit(20)
    .select('username fullName avatar bio followers following isPrivate online');

  res.json({ success: true, data: users });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found.');
  }

  const postsCount = await Post.countDocuments({ author: user._id, isDeleted: false });

  res.json({
    success: true,
    data: {
      ...user.toJSON(),
      postsCount,
      isFollowing: req.user ? user.followers.some((id) => id.equals(req.user._id)) : false,
    },
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['avatar', 'bio', 'website', 'fullName', 'username', 'email', 'mobile', 'isPrivate'];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  res.json({
    success: true,
    message: 'Profile updated.',
    data: req.user,
  });
});

const suggestedUsers = asyncHandler(async (req, res) => {
  const excluded = [req.user._id, ...req.user.following];
  const users = await User.find({
    _id: { $nin: excluded },
    isDeleted: false,
    isBlocked: false,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('username fullName avatar bio followers');

  res.json({ success: true, data: users });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const posts = await Post.find({ author: user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .populate('author', 'username fullName avatar');

  res.json({ success: true, data: posts });
});

const getFollowers = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  await user.populate('followers', 'username fullName avatar bio online');
  res.json({ success: true, data: user.followers });
});

const getFollowing = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  await user.populate('following', 'username fullName avatar bio online');
  res.json({ success: true, data: user.following });
});

const deleteMe = asyncHandler(async (req, res) => {
  req.user.isDeleted = true;
  req.user.isBlocked = true;
  req.user.email = undefined;
  req.user.mobile = undefined;
  req.user.username = `deleted_${req.user._id}`;
  req.user.fullName = 'Deleted account';
  await req.user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Account deleted.',
  });
});

module.exports = {
  searchUsers,
  getProfile,
  updateMe,
  suggestedUsers,
  getUserPosts,
  getFollowers,
  getFollowing,
  deleteMe,
};
