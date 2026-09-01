const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned Faculty ID is required']
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['LEARNING_GAP', 'RISK_ALERT', 'RECOMMENDATION', 'FACULTY_MANUAL'],
      default: 'FACULTY_MANUAL'
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    parentInterventionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intervention',
      default: null
    },
    title: {
      type: String,
      required: [true, 'Intervention title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    actionType: {
      type: String,
      enum: [
        'LEARNING_MATERIAL',
        'PRACTICE_TASK',
        'DOUBT_SESSION',
        'FACULTY_MEETING',
        'ASSIGNMENT_SUPPORT',
        'QUIZ_RETRY',
        'STUDY_PLAN',
        'OTHER'
      ],
      default: 'PRACTICE_TASK'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'CANCELLED', 'OVERDUE'],
      default: 'ASSIGNED'
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    studentResponse: {
      type: String,
      default: '',
      trim: true
    },
    facultyNotes: {
      type: String,
      default: '',
      trim: true
    },
    outcome: {
      type: String,
      enum: ['IMPROVED', 'PARTIALLY_IMPROVED', 'NO_SIGNIFICANT_CHANGE', 'FURTHER_SUPPORT_REQUIRED', 'NOT_COMPLETED', 'PENDING'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

interventionSchema.index({ studentId: 1, courseId: 1, status: 1 });
interventionSchema.index({ assignedFaculty: 1, courseId: 1 });
interventionSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Intervention', interventionSchema);
