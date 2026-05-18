const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const Story = require('../models/Story');

const createStory = asyncHandler(async (req, res) => {
  const { mediaUrl, mediaType = 'image', caption = '' } = req.body;

  if (!mediaUrl) {
    throw new ApiError(422, 'mediaUrl is required.');
  }

  const story = await Story.create({
    author: req.user._id,
    mediaUrl,
    mediaType,
    caption,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await story.populate('author', 'username fullName avatar');

  res.status(201).json({
    success: true,
    message: 'Story added.',
    data: story,
  });
});

const getActiveStories = asyncHandler(async (req, res) => {
  const authors = [req.user._id, ...req.user.following];
  const stories = await Story.find({ author: { $in: authors }, expiresAt: { $gt: new Date() } })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: stories });
});

const viewStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.storyId).populate('author', 'username fullName avatar');

  if (!story || story.expiresAt <= new Date()) {
    throw new ApiError(404, 'Story not found.');
  }

  const alreadyViewed = story.viewers.some((viewer) => viewer.user.equals(req.user._id));

  if (!alreadyViewed && !story.author._id.equals(req.user._id)) {
    story.viewers.push({ user: req.user._id });
    await story.save();
  }

  res.json({ success: true, data: story });
});

const getStoryViewers = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.storyId).populate('viewers.user', 'username fullName avatar');

  if (!story) {
    throw new ApiError(404, 'Story not found.');
  }

  if (!story.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the story owner can view this list.');
  }

  res.json({ success: true, data: story.viewers });
});

const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found.');
  }

  if (!story.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can delete only your own stories.');
  }

  await Story.deleteOne({ _id: story._id });
  res.json({ success: true, message: 'Story deleted.' });
});

module.exports = {
  createStory,
  getActiveStories,
  viewStory,
  getStoryViewers,
  deleteStory,
};
