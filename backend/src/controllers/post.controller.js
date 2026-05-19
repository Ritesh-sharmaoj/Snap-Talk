const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const extractHashtags = require('../utils/extractHashtags');
const Post = require('../models/Post');

const populatePost = (query) => query.populate('author', 'username fullName avatar');

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

const createPost = asyncHandler(async (req, res) => {
  const { mediaUrl, mediaPublicId, mediaType = 'image', thumbnailUrl, caption = '', location } = req.body;

  if (!mediaUrl) {
    throw new ApiError(422, 'mediaUrl is required. Upload media first or provide an existing URL.');
  }

  const hashtags = [...new Set([...(req.body.hashtags || []), ...extractHashtags(caption)])];

  const post = await Post.create({
    author: req.user._id,
    mediaUrl,
    mediaPublicId,
    mediaType,
    thumbnailUrl,
    caption,
    hashtags,
    location,
  });

  await post.populate('author', 'username fullName avatar');

  res.status(201).json({
    success: true,
    message: 'Post published.',
    data: attachUserFlags(post, req.user)[0],
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const { caption, location, hashtags } = req.body;
  const post = await Post.findOne({ _id: req.params.postId, isDeleted: false });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  if (!post.author.equals(req.user._id)) {
    throw new ApiError(403, 'You can edit only your own posts.');
  }

  if (caption !== undefined) {
    post.caption = caption;
    post.hashtags = [...new Set([...(hashtags || []), ...extractHashtags(caption)])];
  }
  if (location !== undefined) post.location = location;

  await post.save();
  await post.populate('author', 'username fullName avatar');

  res.json({
    success: true,
    message: 'Post updated.',
    data: attachUserFlags(post, req.user)[0],
  });
});

const getFeed = asyncHandler(async (req, res) => {
  const authors = [req.user._id, ...req.user.following];
  const posts = await populatePost(
    Post.find({ author: { $in: authors }, isDeleted: false }).sort({ createdAt: -1 }).limit(50)
  );

  res.json({ success: true, data: attachUserFlags(posts, req.user) });
});

const getExplore = asyncHandler(async (req, res) => {
  const posts = await populatePost(
    Post.find({ isDeleted: false })
      .sort({ likes: -1, commentCount: -1, createdAt: -1 })
      .limit(60)
  );

  res.json({ success: true, data: attachUserFlags(posts, req.user) });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await populatePost(Post.findOne({ _id: req.params.postId, isDeleted: false }));

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  res.json({ success: true, data: attachUserFlags(post, req.user)[0] });
});

const getPostsByHashtag = asyncHandler(async (req, res) => {
  const tag = String(req.params.tag || '').toLowerCase().replace('#', '');
  const posts = await populatePost(
    Post.find({ hashtags: tag, isDeleted: false }).sort({ createdAt: -1 }).limit(50)
  );

  res.json({ success: true, data: attachUserFlags(posts, req.user) });
});

const savePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.postId, isDeleted: false });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const hasSaved = req.user.savedPosts.some((id) => id.equals(post._id));

  if (hasSaved) {
    req.user.savedPosts = req.user.savedPosts.filter((id) => !id.equals(post._id));
    post.saves = post.saves.filter((id) => !id.equals(req.user._id));
  } else {
    req.user.savedPosts.push(post._id);
    post.saves.push(req.user._id);
  }

  await Promise.all([req.user.save(), post.save()]);

  res.json({
    success: true,
    message: hasSaved ? 'Post removed from saved.' : 'Post saved.',
    data: { saved: !hasSaved, savesCount: post.saves.length },
  });
});

const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.postId, isDeleted: false },
    { $inc: { sharesCount: 1 } },
    { new: true }
  );

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  res.json({
    success: true,
    message: 'Share tracked.',
    data: { sharesCount: post.sharesCount },
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  if (!post.author.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can delete only your own posts.');
  }

  post.isDeleted = true;
  await post.save();

  res.json({ success: true, message: 'Post deleted.' });
});

module.exports = {
  createPost,
  updatePost,
  getFeed,
  getExplore,
  getPost,
  getPostsByHashtag,
  savePost,
  sharePost,
  deletePost,
};
