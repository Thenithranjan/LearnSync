const mongoose = require('mongoose');

const evidenceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ACCURACY', 'QUESTIONS_COUNT', 'TREND_DECLINE', 'RECENT_ERRORS', 'LOW_ATTENDANCE'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    default: null
  }
});

const learningGapSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    accuracy: {
      type: Number,
      default: 0
    },
    questionsAttempted: {
      type: Number,
      default: 0
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'INSUFFICIENT_DATA'],
      default: 'MEDIUM'
    },
    evidenceLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT'],
      default: 'MEDIUM'
    },
    evidence: [evidenceItemSchema],
    isResolved: {
      type: Boolean,
      default: false
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

learningGapSchema.index({ studentId: 1, courseId: 1, topic: 1 });
learningGapSchema.index({ courseId: 1, severity: 1 });

module.exports = mongoose.model('LearningGap', learningGapSchema);
