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

  const comments = await Comment.find({
    targetType,
    target: targetId,
    parent: null,
  })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: comments });
});

const listReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const replies = await Comment.find({ parent: commentId })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: replies });
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
    io: req.app.get('io'),
  });

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    data: comment,
  });
});

const addReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const parentComment = await Comment.findById(commentId);

  if (!parentComment) {
    throw new ApiError(404, 'Parent comment not found.');
  }

  const reply = await Comment.create({
    author: req.user._id,
    targetType: parentComment.targetType,
    target: parentComment.target,
    parent: parentComment._id,
    text: req.body.text,
  });

  const Target = models[parentComment.targetType];
  if (Target) {
    await Target.findByIdAndUpdate(parentComment.target, { $inc: { commentCount: 1 } });
  }

  await reply.populate('author', 'username fullName avatar');

  await createNotification({
    recipient: parentComment.author,
    actor: req.user._id,
    type: 'comment',
    entityType: parentComment.targetType,
    entity: parentComment.target,
    text: `${req.user.username} replied to your comment: ${reply.text.slice(0, 80)}`,
    io: req.app.get('io'),
  });

  res.status(201).json({
    success: true,
    message: 'Reply added.',
    data: reply,
  });
});

const editComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (!comment.author.equals(req.user._id)) {
    throw new ApiError(403, 'You can edit only your own comments.');
  }

  comment.text = text || comment.text;
  await comment.save();
  await comment.populate('author', 'username fullName avatar');

  res.json({
    success: true,
    message: 'Comment updated.',
    data: comment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const Target = models[comment.targetType];
  const target = Target ? await Target.findById(comment.target) : null;

  const isAuthor = comment.author.equals(req.user._id);
  const isTargetAuthor = target && target.author.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isTargetAuthor && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this comment.');
  }

  // Count replies to decrement target's commentCount correctly
  const repliesCount = await Comment.countDocuments({ parent: comment._id });
  const totalDeleted = 1 + repliesCount;

  await Comment.deleteMany({
    $or: [{ _id: comment._id }, { parent: comment._id }],
  });

  if (Target) {
    await Target.findByIdAndUpdate(comment.target, { $inc: { commentCount: -totalDeleted } });
  }

  res.json({ success: true, message: 'Comment deleted.' });
});

module.exports = {
  listComments,
  listReplies,
  addComment,
  addReply,
  editComment,
  deleteComment,
};
