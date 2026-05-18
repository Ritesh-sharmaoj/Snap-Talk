const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createNotification = require('../utils/createNotification');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Reel = require('../models/Reel');

const models = {
  Post,
  Reel,
};

const listComments = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;

  if (!models[targetType]) {
    throw new ApiError(422, 'Invalid comment target.');
  }

  const comments = await Comment.find({ targetType, target: targetId })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: comments });
});

const addComment = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const Target = models[targetType];

  if (!Target) {
    throw new ApiError(422, 'Invalid comment target.');
  }

  const target = await Target.findById(targetId);

  if (!target || target.isDeleted) {
    throw new ApiError(404, `${targetType} not found.`);
  }

  const comment = await Comment.create({
    author: req.user._id,
    targetType,
    target: target._id,
    text: req.body.text,
  });

  target.commentCount += 1;
  await target.save();
  await comment.populate('author', 'username fullName avatar');

  await createNotification({
    recipient: target.author,
    actor: req.user._id,
    type: 'comment',
    entityType: targetType,
    entity: target._id,
    text: `${req.user.username} commented: ${comment.text.slice(0, 80)}`,
  });

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    data: comment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (!comment.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can delete only your own comments.');
  }

  await Comment.deleteOne({ _id: comment._id });

  const Target = models[comment.targetType];
  if (Target) {
    await Target.findByIdAndUpdate(comment.target, { $inc: { commentCount: -1 } });
  }

  res.json({ success: true, message: 'Comment deleted.' });
});

module.exports = {
  listComments,
  addComment,
  deleteComment,
};
