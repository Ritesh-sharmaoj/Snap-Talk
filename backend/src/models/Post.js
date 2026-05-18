const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaPublicId: String,
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    thumbnailUrl: String,
    caption: {
      type: String,
      default: '',
      maxlength: 2200,
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
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
    location: String,
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

postSchema.index({ caption: 'text', hashtags: 'text' });
postSchema.index({ createdAt: -1 });

postSchema.virtual('likesCount').get(function getLikesCount() {
  return this.likes?.length || 0;
});

postSchema.virtual('savesCount').get(function getSavesCount() {
  return this.saves?.length || 0;
});

module.exports = mongoose.model('Post', postSchema);
