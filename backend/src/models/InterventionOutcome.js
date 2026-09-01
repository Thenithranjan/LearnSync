const mongoose = require('mongoose');

const interventionOutcomeSchema = new mongoose.Schema(
  {
    interventionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intervention',
      required: true,
      unique: true
    },
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
    beforeScore: {
      type: Number,
      default: 0
    },
    afterScore: {
      type: Number,
      default: null
    },
    improvement: {
      type: Number,
      default: null
    },
    classification: {
      type: String,
      enum: ['SIGNIFICANT_IMPROVEMENT', 'MODERATE_IMPROVEMENT', 'NO_SIGNIFICANT_CHANGE', 'DECLINE', 'PENDING'],
      default: 'PENDING'
    },
    measurementStatus: {
      type: String,
      enum: ['PENDING', 'MEASURED', 'INSUFFICIENT_DATA'],
      default: 'PENDING'
    },
    evaluatedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

interventionOutcomeSchema.index({ studentId: 1, courseId: 1 });
interventionOutcomeSchema.index({ interventionId: 1 });

module.exports = mongoose.model('InterventionOutcome', interventionOutcomeSchema);
