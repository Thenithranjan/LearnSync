const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Assessment = require('../../models/Assessment');
const Submission = require('../../models/Submission');
const AttendanceSession = require('../../models/AttendanceSession');
const AttendanceRecord = require('../../models/AttendanceRecord');
const LearningProgress = require('../../models/LearningProgress');
const Material = require('../../models/Material');
const Thread = require('../../models/Thread');
const Reply = require('../../models/Reply');
const {
  safePercentage,
  calculateOverallScore,
  calculateEngagementScore,
  calculateGradeDistribution
} = require('./analytics.utils');

class CourseAnalyticsService {
  /**
   * Get class assessment performance trends for a course
   */
  static async getCourseTrends(courseId) {
    const course = await Course.findById(courseId).lean();
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const assessments = await Assessment.find({
      courseId,
      isPublished: true
    }).sort({ createdAt: 1 }).lean();

    if (!assessments.length) {
      return { labels: [], scores: [], assessments: [] };
    }

    const labels = [];
    const scores = [];
    const assessmentDetails = [];

    for (const assess of assessments) {
      const submissions = await Submission.find({
        assessmentId: assess._id,
        status: 'GRADED'
      }).lean();

      let averageScore = null;
      if (submissions.length > 0) {
        const totalPct = submissions.reduce((sum, s) => sum + (s.percentage || 0), 0);
        averageScore = Number((totalPct / submissions.length).toFixed(1));
      }

      labels.push(assess.title);
      scores.push(averageScore !== null ? averageScore : 0);
      assessmentDetails.push({
        assessmentId: assess._id,
        title: assess.title,
        type: assess.type,
        totalPoints: assess.totalPoints,
        submissionsCount: submissions.length,
        averagePercentage: averageScore
      });
    }

    return {
      labels,
      scores,
      assessments: assessmentDetails
    };
  }

  /**
   * Get student grade distribution for a course (90-100%, 80-89%, etc.)
   */
  static async getCourseDistribution(courseId) {
    const studentsData = await this.getCourseStudents(courseId);

    const overallScores = studentsData.students
      .map((s) => s.overallScore)
      .filter((score) => score !== null);

    const distribution = calculateGradeDistribution(overallScores);

    return {
      totalGradedStudents: overallScores.length,
      totalEnrolled: studentsData.totalEnrolled,
      distribution
    };
  }

  /**
   * Get comprehensive list of students in a course with academic breakdown
   */
  static async getCourseStudents(courseId, options = {}) {
    const { sortBy = 'overallScore', sortOrder = 'desc', search = '' } = options;

    const course = await Course.findById(courseId).lean();
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const enrollments = await Enrollment.find({ courseId, status: 'ACTIVE' })
      .populate('studentId', 'name email department profileImage')
      .lean();

    const activeEnrollments = enrollments.filter((e) => e.studentId !== null);

    // Get published course items
    const assignments = await Assessment.find({ courseId, type: 'ASSIGNMENT', isPublished: true }).lean();
    const quizzes = await Assessment.find({ courseId, type: 'QUIZ', isPublished: true }).lean();
    const sessions = await AttendanceSession.find({ courseId }).lean();
    const materials = await Material.find({ isPublished: true }).populate({
      path: 'moduleId',
      match: { courseId }
    }).lean();
    const courseMaterials = materials.filter((m) => m.moduleId !== null);

    const students = [];

    for (const enr of activeEnrollments) {
      const student = enr.studentId;
      const studentId = student._id;

      // Filter by search if provided
      if (search) {
        const term = search.toLowerCase();
        const matchesName = student.name && student.name.toLowerCase().includes(term);
        const matchesEmail = student.email && student.email.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail) continue;
      }

      // 1. Assignment Score
      let assignmentScore = null;
      if (assignments.length > 0) {
        const assignSubs = await Submission.find({
          studentId,
          courseId,
          assessmentId: { $in: assignments.map((a) => a._id) },
          status: 'GRADED'
        }).lean();

        let totalEarned = 0;
        let totalAvailable = 0;
        assignments.forEach((assign) => {
          const sub = assignSubs.find((s) => s.assessmentId.toString() === assign._id.toString());
          if (sub) {
            totalEarned += (sub.score || 0);
            totalAvailable += (sub.totalPoints || assign.totalPoints || 100);
          } else {
            totalAvailable += (assign.totalPoints || 100);
          }
        });
        assignmentScore = safePercentage(totalEarned, totalAvailable);
      }

      // 2. Quiz Score
      let quizScore = null;
      if (quizzes.length > 0) {
        const quizSubs = await Submission.find({
          studentId,
          courseId,
          assessmentId: { $in: quizzes.map((q) => q._id) },
          status: 'GRADED'
        }).lean();

        const bestAttempts = new Map();
        quizSubs.forEach((sub) => {
          const aId = sub.assessmentId.toString();
          const existing = bestAttempts.get(aId);
          if (!existing || (sub.percentage || 0) > (existing.percentage || 0)) {
            bestAttempts.set(aId, sub);
          }
        });

        if (bestAttempts.size > 0) {
          let totalPct = 0;
          bestAttempts.forEach((sub) => {
            totalPct += (sub.percentage || 0);
          });
          quizScore = Number((totalPct / bestAttempts.size).toFixed(1));
        }
      }

      // 3. Attendance
      let attendancePercentage = null;
      if (sessions.length > 0) {
        const records = await AttendanceRecord.find({
          studentId,
          courseId,
          sessionId: { $in: sessions.map((s) => s._id) }
        }).lean();

        const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
        attendancePercentage = safePercentage(presentCount, sessions.length);
      }

      // 4. Learning Progress
      let learningProgress = null;
      if (courseMaterials.length > 0) {
        const progressDocs = await LearningProgress.find({
          studentId,
          courseId,
          materialId: { $in: courseMaterials.map((m) => m._id) },
          completed: true
        }).lean();

        learningProgress = safePercentage(progressDocs.length, courseMaterials.length);
      }

      // 5. Engagement
      const threadsCount = await Thread.countDocuments({ authorId: studentId, courseId });
      const replies = await Reply.find({ authorId: studentId }).populate({
        path: 'threadId',
        match: { courseId }
      }).lean();
      const applicableReplies = replies.filter((r) => r.threadId !== null);
      const endorsedReplies = applicableReplies.filter((r) => r.isFacultyEndorsed).length;
      const upvotesReceived = applicableReplies.reduce((sum, r) => sum + (r.upvoteCount || 0), 0);

      const engagementScore = calculateEngagementScore({
        threadsCreated: threadsCount,
        repliesPosted: applicableReplies.length,
        upvotesReceived,
        endorsedReplies
      });

      // Overall Score
      const overallScore = calculateOverallScore({
        assignmentScore,
        quizScore,
        attendancePercentage,
        learningProgress,
        engagementScore
      });

      students.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        profileImage: student.profileImage,
        overallScore,
        attendance: attendancePercentage,
        quizPerformance: quizScore,
        assignmentPerformance: assignmentScore,
        learningProgress,
        engagement: engagementScore
      });
    }

    // Dynamic sorting
    students.sort((a, b) => {
      const valA = a[sortBy] !== null && a[sortBy] !== undefined ? a[sortBy] : -1;
      const valB = b[sortBy] !== null && b[sortBy] !== undefined ? b[sortBy] : -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return {
      courseId,
      courseTitle: course.title,
      courseCode: course.code,
      totalEnrolled: activeEnrollments.length,
      students
    };
  }
}

module.exports = CourseAnalyticsService;
