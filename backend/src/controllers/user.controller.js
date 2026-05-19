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

const attachUserFlags = (posts, user) => {
  const postList = Array.isArray(posts) ? posts : [posts];
  return postList.map((post) => {
    const p = post.toObject ? post.toObject() : post;
    return {
      ...p,
      isLiked: user ? p.likes?.some((id) => id.toString() === user._id.toString()) : false,
      isSaved: user ? user.savedPosts?.some((id) => id.toString() === p._id.toString()) : false,
    };
  });
};

const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const users = await User.find({
    isDeleted: false,
    isBlocked: false,
    _id: { $nin: [...req.user.blockedUsers, req.user._id] },
    blockedUsers: { $ne: req.user._id },
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

  if (user.blockedUsers.includes(req.user._id) || req.user.blockedUsers.includes(user._id)) {
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
  const excluded = [req.user._id, ...req.user.following, ...req.user.blockedUsers];
  const users = await User.find({
    _id: { $nin: excluded },
    blockedUsers: { $ne: req.user._id },
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

  res.json({ success: true, data: attachUserFlags(posts, req.user) });
});

const getFollowers = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found.');
  }

  // Privacy check
  if (user.isPrivate && !user._id.equals(req.user._id) && !req.user.following.includes(user._id)) {
    throw new ApiError(403, 'This account is private.');
  }

  await user.populate('followers', 'username fullName avatar bio online');
  
  const followers = user.followers.map((f) => ({
    ...f.toJSON(),
    isFollowing: req.user.following.includes(f._id),
  }));

  res.json({ success: true, data: followers });
});

const getFollowing = asyncHandler(async (req, res) => {
  const user = await resolveUser(req.params.idOrUsername);

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found.');
  }

  // Privacy check
  if (user.isPrivate && !user._id.equals(req.user._id) && !req.user.following.includes(user._id)) {
    throw new ApiError(403, 'This account is private.');
  }

  await user.populate('following', 'username fullName avatar bio online');

  const following = user.following.map((f) => ({
    ...f.toJSON(),
    isFollowing: req.user.following.includes(f._id),
  }));

  res.json({ success: true, data: following });
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

const getSavedPosts = asyncHandler(async (req, res) => {
  await req.user.populate({
    path: 'savedPosts',
    match: { isDeleted: false },
    populate: { path: 'author', select: 'username fullName avatar' },
  });

  res.json({ success: true, data: attachUserFlags(req.user.savedPosts, req.user) });
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await User.findById(id);

  if (!target) {
    throw new ApiError(404, 'User not found.');
  }

  if (target._id.equals(req.user._id)) {
    throw new ApiError(422, 'You cannot block yourself.');
  }

  if (!req.user.blockedUsers.includes(target._id)) {
    req.user.blockedUsers.push(target._id);
    // Auto unfollow
    req.user.following = req.user.following.filter((fid) => !fid.equals(target._id));
    target.followers = target.followers.filter((fid) => !fid.equals(req.user._id));
    
    await Promise.all([req.user.save(), target.save()]);
  }

  res.json({
    success: true,
    message: 'User blocked.',
  });
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  req.user.blockedUsers = req.user.blockedUsers.filter((uid) => !uid.equals(id));
  await req.user.save();

  res.json({
    success: true,
    message: 'User unblocked.',
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
  getSavedPosts,
  deleteMe,
  blockUser,
  unblockUser,
};
