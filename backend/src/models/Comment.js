const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Post', 'Reel'],
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.virtual('likesCount').get(function getLikesCount() {
  return this.likes?.length || 0;
});

module.exports = mongoose.model('Comment', commentSchema);
