const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'COMPLETED', 'DROPPED'],
        message: 'Enrollment status must be ACTIVE, COMPLETED, or DROPPED'
      },
      default: 'ACTIVE',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index preventing duplicate student enrollment per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
