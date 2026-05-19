const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createNotification = require('../utils/createNotification');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Comment = require('../models/Comment');

const toggleLike = async ({ model, id, user, notifyType, entityType, textBuilder, io }) => {
  const doc = await model.findById(id);

  if (!doc || doc.isDeleted) {
    throw new ApiError(404, `${entityType} not found.`);
  }

  const isLiked = doc.likes.some((likedBy) => likedBy.equals(user._id));
  doc.likes = isLiked
    ? doc.likes.filter((likedBy) => !likedBy.equals(user._id))
    : [...doc.likes, user._id];

  await doc.save();

  if (!isLiked && doc.author) {
    await createNotification({
      recipient: doc.author,
      actor: user._id,
      type: notifyType,
      entityType,
      entity: doc._id,
      text: textBuilder(user),
      io,
    });
  }

  return {
    liked: !isLiked,
    likesCount: doc.likes.length,
  };
};

const likePost = asyncHandler(async (req, res) => {
  const data = await toggleLike({
    model: Post,
    id: req.params.postId,
    user: req.user,
    notifyType: 'like',
    entityType: 'Post',
    textBuilder: (user) => `${user.username} liked your post.`,
    io: req.app.get('io'),
  });

  res.json({ success: true, data });
});

const likeReel = asyncHandler(async (req, res) => {
  const data = await toggleLike({
    model: Reel,
    id: req.params.reelId,
    user: req.user,
    notifyType: 'like',
    entityType: 'Reel',
    textBuilder: (user) => `${user.username} liked your reel.`,
    io: req.app.get('io'),
  });

  res.json({ success: true, data });
});

const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const isLiked = comment.likes.some((likedBy) => likedBy.equals(req.user._id));
  comment.likes = isLiked
    ? comment.likes.filter((likedBy) => !likedBy.equals(req.user._id))
    : [...comment.likes, req.user._id];
  await comment.save();

  if (!isLiked) {
    await createNotification({
      recipient: comment.author,
      actor: req.user._id,
      type: 'like',
      entityType: 'Comment',
      entity: comment._id,
      text: `${req.user.username} liked your comment.`,
      io: req.app.get('io'),
    });
  }

  res.json({
    success: true,
    data: {
      liked: !isLiked,
      likesCount: comment.likes.length,
    },
  });
});

const getLikes = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  let model;

  if (type === 'posts') model = Post;
  else if (type === 'reels') model = Reel;
  else if (type === 'comments') model = Comment;
  else throw new ApiError(400, 'Invalid type.');

  const doc = await model.findById(id).populate('likes', 'username fullName avatar');

  if (!doc || doc.isDeleted) {
    throw new ApiError(404, 'Entity not found.');
  }

  res.json({
    success: true,
    data: {
      likes: doc.likes,
      likesCount: doc.likes.length,
    },
  });
});

module.exports = {
  likePost,
  likeReel,
  likeComment,
  getLikes,
};
