const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  selectedOptionIndex: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

const submissionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment reference is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED'],
      default: 'SUBMITTED'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    // For open-ended Assignments
    content: {
      type: String,
      trim: true,
      default: ''
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: ''
    },
    // For Quizzes
    answers: [studentAnswerSchema],
    
    // Grading fields
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPoints: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      default: 0
    },
    isPassed: {
      type: Boolean,
      default: false
    },
    feedback: {
      type: String,
      trim: true,
      default: ''
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    gradedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ assessmentId: 1, studentId: 1 });
submissionSchema.index({ courseId: 1, studentId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
