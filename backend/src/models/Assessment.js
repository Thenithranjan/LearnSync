const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctOptionIndex: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  }
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['ASSIGNMENT', 'QUIZ'],
      required: [true, 'Assessment type is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty creator reference is required']
    },
    totalPoints: {
      type: Number,
      default: 100,
      min: 0
    },
    passingScore: {
      type: Number,
      default: 50,
      min: 0
    },
    dueDate: {
      type: Date,
      default: null
    },
    timeLimitMinutes: {
      type: Number,
      default: 0 // 0 means no time limit
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    instructions: {
      type: String,
      default: ''
    },
    questions: [questionSchema] // Only populated when type === 'QUIZ'
  },
  {
    timestamps: true
  }
);

assessmentSchema.index({ courseId: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
