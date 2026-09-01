const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty creator reference is required']
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Session date is required']
    },
    sessionType: {
      type: String,
      enum: ['LECTURE', 'LAB', 'TUTORIAL', 'SEMINAR'],
      default: 'LECTURE'
    },
    otpCode: {
      type: String,
      default: '',
      trim: true
    },
    isOtpActive: {
      type: Boolean,
      default: false
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

attendanceSessionSchema.index({ courseId: 1, date: -1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
