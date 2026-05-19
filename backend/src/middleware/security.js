const rateLimit = require('express-rate-limit');

const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const models = {
  Post,
  Reel,
  Story,
  Comment,
  Message,
};

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests
  message: 'Too many password reset requests from this IP, please try again after an hour.',
});

const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests
  message: 'Too many uploads from this IP, please try again after an hour.',
});

const checkOwnership = (modelName, paramName = 'id') =>
  asyncHandler(async (req, res, next) => {
    const Model = models[modelName];
    if (!Model) {
      throw new ApiError(500, `Invalid model name: ${modelName}`);
    }

    const docId = req.params[paramName];
    const doc = await Model.findById(docId);

    if (!doc || doc.isDeleted) {
      throw new ApiError(404, `${modelName} not found.`);
    }

    const authorId = doc.author || doc.sender;

    if (!authorId) {
      throw new ApiError(500, `Could not determine owner for ${modelName}`);
    }

    if (!authorId.equals(req.user._id) && req.user.role !== 'admin') {
      throw new ApiError(403, `You are not authorized to perform this action on this ${modelName.toLowerCase()}.`);
    }

    req.doc = doc;
    next();
  });

module.exports = {
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  checkOwnership,
};
