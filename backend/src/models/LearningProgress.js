const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material ID is required']
    },
    completed: {
      type: Boolean,
      default: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index for fast lookups per student and material
learningProgressSchema.index({ studentId: 1, materialId: 1 }, { unique: true });
learningProgressSchema.index({ studentId: 1, courseId: 1 });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

module.exports = LearningProgress;
