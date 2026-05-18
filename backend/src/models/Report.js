const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Post', 'Reel', 'Story', 'Comment', 'User', 'Message'],
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'harassment', 'nudity', 'violence', 'hate', 'scam', 'other'],
    },
    details: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved', 'dismissed'],
      default: 'open',
    },
    moderatorNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ targetType: 1, target: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
