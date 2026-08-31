const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    thumbnail: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
        message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED'
      },
      default: 'DRAFT',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Additional indexes for query optimization
courseSchema.index({ status: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ department: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
