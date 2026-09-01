const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    title: {
      type: String,
      required: [true, 'Thread title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters']
    },
    content: {
      type: String,
      required: [true, 'Thread content is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['QUESTION', 'DISCUSSION', 'RESOURCE', 'ANNOUNCEMENT'],
      default: 'QUESTION'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    isResolved: {
      type: Boolean,
      default: false
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
    viewsCount: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

threadSchema.index({ courseId: 1, isPinned: -1, createdAt: -1 });
threadSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Thread', threadSchema);
