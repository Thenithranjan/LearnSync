const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      required: [true, 'Thread reference is required']
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true
    },
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply',
      default: null
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    upvoteCount: {
      type: Number,
      default: 0
    },
    isAcceptedAnswer: {
      type: Boolean,
      default: false
    },
    isFacultyEndorsed: {
      type: Boolean,
      default: false
    },
    endorsedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    endorsedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

replySchema.index({ threadId: 1, createdAt: 1 });

module.exports = mongoose.model('Reply', replySchema);
