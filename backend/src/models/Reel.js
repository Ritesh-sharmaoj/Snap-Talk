const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    mediaPublicId: String,
    thumbnailUrl: String,
    caption: {
      type: String,
      default: '',
      maxlength: 1200,
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    audioTitle: {
      type: String,
      default: 'Original audio',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    reportsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reelSchema.index({ caption: 'text', hashtags: 'text', audioTitle: 'text' });
reelSchema.index({ createdAt: -1 });

reelSchema.virtual('likesCount').get(function getLikesCount() {
  return this.likes?.length || 0;
});

module.exports = mongoose.model('Reel', reelSchema);
