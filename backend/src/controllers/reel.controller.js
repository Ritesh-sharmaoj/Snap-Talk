const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const extractHashtags = require('../utils/extractHashtags');
const Reel = require('../models/Reel');

const populateReel = (query) => query.populate('author', 'username fullName avatar');

const createReel = asyncHandler(async (req, res) => {
  const { videoUrl, thumbnailUrl, caption = '', audioTitle = 'Original audio' } = req.body;

  if (!videoUrl) {
    throw new ApiError(422, 'videoUrl is required.');
  }

  const hashtags = [...new Set([...(req.body.hashtags || []), ...extractHashtags(caption)])];

  const reel = await Reel.create({
    author: req.user._id,
    videoUrl,
    thumbnailUrl,
    caption,
    hashtags,
    audioTitle,
  });

  await reel.populate('author', 'username fullName avatar');

  res.status(201).json({
    success: true,
    message: 'Reel published.',
    data: reel,
  });
});

const getReels = asyncHandler(async (req, res) => {
  const reels = await populateReel(
    Reel.find({ isDeleted: false }).sort({ createdAt: -1, likes: -1 }).limit(50)
  );

  res.json({ success: true, data: reels });
});

const getReel = asyncHandler(async (req, res) => {
  const reel = await populateReel(Reel.findOne({ _id: req.params.reelId, isDeleted: false }));

  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  res.json({ success: true, data: reel });
});

const shareReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findOneAndUpdate(
    { _id: req.params.reelId, isDeleted: false },
    { $inc: { sharesCount: 1 } },
    { new: true }
  );

  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  res.json({ success: true, data: { sharesCount: reel.sharesCount } });
});

const deleteReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.reelId);

  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  if (!reel.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can delete only your own reels.');
  }

  reel.isDeleted = true;
  await reel.save();

  res.json({ success: true, message: 'Reel deleted.' });
});

module.exports = {
  createReel,
  getReels,
  getReel,
  shareReel,
  deleteReel,
};
