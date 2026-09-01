const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

class AttendanceService {
  /**
   * Create class attendance session & optional OTP code
   */
  static async createSession(facultyId, courseId, data) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    let otpCode = '';
    let otpExpiresAt = null;
    let isOtpActive = false;

    if (data.enableOtp) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const validityMinutes = Number(data.otpValidityMinutes) || 15;
      otpExpiresAt = new Date(Date.now() + validityMinutes * 60000);
      isOtpActive = true;
    }

    const session = await AttendanceSession.create({
      courseId,
      facultyId,
      title: data.title || `Class Session - ${new Date().toLocaleDateString()}`,
      date: data.date ? new Date(data.date) : new Date(),
      sessionType: data.sessionType || 'LECTURE',
      otpCode,
      isOtpActive,
      otpExpiresAt,
      notes: data.notes || ''
    });

    // Automatically initialize ABSENT records for all currently enrolled active students
    const enrollments = await Enrollment.find({ courseId, status: 'ACTIVE' });
    if (enrollments.length > 0) {
      const initialRecords = enrollments.map((enr) => ({
        sessionId: session._id,
        courseId,
        studentId: enr.studentId,
        status: 'ABSENT',
        markedBy: 'FACULTY'
      }));
      await AttendanceRecord.insertMany(initialRecords, { ordered: false }).catch(() => {});
    }

    return session;
  }

  /**
   * Get all sessions for a course
   */
  static async getCourseSessions(courseId, userRole) {
    const sessions = await AttendanceSession.find({ courseId })
      .populate('facultyId', 'name email')
      .sort({ date: -1 });

    if (userRole === 'STUDENT') {
      return sessions.map((s) => {
        const item = s.toObject();
        delete item.otpCode; // Hide OTP from list view for students
        return item;
      });
    }

    return sessions;
  }

  /**
   * Get a session with its complete student roster
   */
  static async getSessionRoster(sessionId) {
    const session = await AttendanceSession.findById(sessionId).populate('courseId', 'title code');
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    const enrollments = await Enrollment.find({ courseId: session.courseId._id, status: 'ACTIVE' })
      .populate('studentId', 'name email department');

    const records = await AttendanceRecord.find({ sessionId });
    const recordMap = {};
    records.forEach((r) => {
      recordMap[r.studentId.toString()] = r;
    });

    const roster = enrollments.map((enr) => {
      const student = enr.studentId;
      const rec = recordMap[student._id.toString()];
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        status: rec ? rec.status : 'ABSENT',
        markedBy: rec ? rec.markedBy : 'FACULTY',
        markedAt: rec ? rec.markedAt : null,
        remarks: rec ? rec.remarks : ''
      };
    });

    return { session, roster };
  }

  /**
   * Batch mark or update attendance for a session (Faculty / Admin)
   */
  static async batchMarkAttendance(sessionId, facultyId, records) {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { sessionId, studentId: rec.studentId },
        update: {
          $set: {
            courseId: session.courseId,
            status: rec.status,
            markedBy: 'FACULTY',
            markedAt: new Date(),
            remarks: rec.remarks || ''
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await AttendanceRecord.bulkWrite(bulkOps);
    }

    return { message: 'Attendance updated successfully' };
  }

  /**
   * Student self check-in using OTP
   */
  static async selfCheckIn(studentId, courseId, otpCode) {
    if (!otpCode) {
      const error = new Error('Please provide the session check-in code');
      error.statusCode = 400;
      throw error;
    }

    const activeSession = await AttendanceSession.findOne({
      courseId,
      otpCode: otpCode.trim(),
      isOtpActive: true,
      status: 'ACTIVE'
    });

    if (!activeSession) {
      const error = new Error('Invalid check-in code or session is not active');
      error.statusCode = 400;
      throw error;
    }

    if (activeSession.otpExpiresAt && new Date() > activeSession.otpExpiresAt) {
      const error = new Error('Check-in code has expired');
      error.statusCode = 400;
      throw error;
    }

    // Verify student is enrolled
    const enrollment = await Enrollment.findOne({ courseId, studentId, status: 'ACTIVE' });
    if (!enrollment) {
      const error = new Error('You are not enrolled in this course');
      error.statusCode = 403;
      throw error;
    }

    const record = await AttendanceRecord.findOneAndUpdate(
      { sessionId: activeSession._id, studentId },
      {
        courseId,
        status: 'PRESENT',
        markedBy: 'SELF_OTP',
        markedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return { message: 'Attendance checked in successfully!', record };
  }

  /**
   * Student attendance summary for a course
   */
  static async getStudentAttendanceSummary(courseId, studentId) {
    const totalSessions = await AttendanceSession.countDocuments({ courseId });
    const records = await AttendanceRecord.find({ courseId, studentId })
      .populate('sessionId', 'title date sessionType')
      .sort({ createdAt: -1 });

    const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;

    const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
    const isAtRisk = totalSessions > 0 && percentage < 75;

    return {
      courseId,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      percentage,
      isAtRisk,
      records
    };
  }

  /**
   * Faculty / Admin course-wide attendance report
   */
  static async getCourseAttendanceReport(courseId) {
    const totalSessions = await AttendanceSession.countDocuments({ courseId });
    const enrollments = await Enrollment.find({ courseId, status: 'ACTIVE' })
      .populate('studentId', 'name email department');

    const allRecords = await AttendanceRecord.find({ courseId });

    const studentStats = enrollments.map((enr) => {
      const student = enr.studentId;
      const studentRecs = allRecords.filter(
        (r) => r.studentId.toString() === student._id.toString()
      );
      const presentCount = studentRecs.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const absentCount = studentRecs.filter((r) => r.status === 'ABSENT').length;
      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        totalSessions,
        presentCount,
        absentCount,
        percentage,
        isAtRisk: totalSessions > 0 && percentage < 75
      };
    });

    return {
      courseId,
      totalSessions,
      totalStudents: enrollments.length,
      studentStats
    };
  }
}

module.exports = AttendanceService;
