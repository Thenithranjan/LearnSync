const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['MATERIAL', 'PRACTICE', 'REVIEW', 'FACULTY_SUPPORT'],
      default: 'MATERIAL'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    targetUrl: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'DISMISSED'],
      default: 'PENDING'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

recommendationSchema.index({ studentId: 1, courseId: 1, topic: 1, status: 1 });
recommendationSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
