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
  calculateEngagementScore
} = require('./analytics.utils');

class StudentAnalyticsService {
  /**
   * Get student overall academic summary (across all enrolled courses or specific course)
   */
  static async getStudentOverview(studentId, options = {}) {
    const { courseId } = options;

    // 1. Get active enrolled courses
    const enrollmentQuery = { studentId, status: 'ACTIVE' };
    if (courseId) {
      enrollmentQuery.courseId = courseId;
    }
    const enrollments = await Enrollment.find(enrollmentQuery).lean();
    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return {
        overallScore: null,
        assignmentPerformance: null,
        quizPerformance: null,
        attendance: null,
        learningProgress: null,
        engagement: null,
        metrics: {
          enrolledCoursesCount: 0,
          assignmentsTotal: 0,
          assignmentsSubmitted: 0,
          quizzesTotal: 0,
          quizzesAttempted: 0,
          attendanceSessionsTotal: 0,
          attendancePresentCount: 0,
          materialsTotal: 0,
          materialsCompleted: 0,
          forumPostsCount: 0
        }
      };
    }

    // 2. Assignment Performance Calculation
    const assignments = await Assessment.find({
      courseId: { $in: courseIds },
      type: 'ASSIGNMENT',
      isPublished: true
    }).lean();

    let assignmentScore = null;
    let assignmentsSubmitted = 0;
    if (assignments.length > 0) {
      const assignmentIds = assignments.map((a) => a._id);
      const assignmentSubs = await Submission.find({
        studentId,
        assessmentId: { $in: assignmentIds },
        status: 'GRADED'
      }).lean();

      assignmentsSubmitted = assignmentSubs.length;

      let totalEarned = 0;
      let totalAvailable = 0;

      assignments.forEach((assign) => {
        const sub = assignmentSubs.find((s) => s.assessmentId.toString() === assign._id.toString());
        if (sub) {
          totalEarned += (sub.score || 0);
          totalAvailable += (sub.totalPoints || assign.totalPoints || 100);
        } else {
          // Unsubmitted published assignment counts against available marks
          totalAvailable += (assign.totalPoints || 100);
        }
      });

      assignmentScore = safePercentage(totalEarned, totalAvailable);
    }

    // 3. Quiz Performance Calculation (Best attempt per quiz)
    const quizzes = await Assessment.find({
      courseId: { $in: courseIds },
      type: 'QUIZ',
      isPublished: true
    }).lean();

    let quizScore = null;
    let quizzesAttempted = 0;
    if (quizzes.length > 0) {
      const quizIds = quizzes.map((q) => q._id);
      const quizSubs = await Submission.find({
        studentId,
        assessmentId: { $in: quizIds },
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

      quizzesAttempted = bestAttempts.size;

      if (bestAttempts.size > 0) {
        let totalPct = 0;
        bestAttempts.forEach((sub) => {
          totalPct += (sub.percentage || 0);
        });
        quizScore = Number((totalPct / bestAttempts.size).toFixed(1));
      }
    }

    // 4. Attendance Percentage Calculation
    const sessions = await AttendanceSession.find({
      courseId: { $in: courseIds }
    }).lean();

    let attendancePercentage = null;
    let presentCount = 0;
    if (sessions.length > 0) {
      const sessionIds = sessions.map((s) => s._id);
      const records = await AttendanceRecord.find({
        studentId,
        sessionId: { $in: sessionIds }
      }).lean();

      presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      attendancePercentage = safePercentage(presentCount, sessions.length);
    }

    // 5. Learning Progress Calculation
    const materials = await Material.find({
      isPublished: true
    }).populate({
      path: 'moduleId',
      match: { courseId: { $in: courseIds } }
    }).lean();

    const applicableMaterials = materials.filter((m) => m.moduleId !== null);
    let learningProgress = null;
    let completedMaterials = 0;

    if (applicableMaterials.length > 0) {
      const materialIds = applicableMaterials.map((m) => m._id);
      const progressDocs = await LearningProgress.find({
        studentId,
        materialId: { $in: materialIds },
        completed: true
      }).lean();

      completedMaterials = progressDocs.length;
      learningProgress = safePercentage(completedMaterials, applicableMaterials.length);
    }

    // 6. Discussion Engagement Calculation
    const threadsCount = await Thread.countDocuments({
      authorId: studentId,
      courseId: { $in: courseIds }
    });
    const replies = await Reply.find({ authorId: studentId }).populate({
      path: 'threadId',
      match: { courseId: { $in: courseIds } }
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

    // 7. Overall Performance Score (Weighted standard formula)
    const overallScore = calculateOverallScore({
      assignmentScore,
      quizScore,
      attendancePercentage,
      learningProgress,
      engagementScore
    });

    return {
      overallScore,
      assignmentPerformance: assignmentScore,
      quizPerformance: quizScore,
      attendance: attendancePercentage,
      learningProgress,
      engagement: engagementScore,
      metrics: {
        enrolledCoursesCount: courseIds.length,
        assignmentsTotal: assignments.length,
        assignmentsSubmitted,
        quizzesTotal: quizzes.length,
        quizzesAttempted,
        attendanceSessionsTotal: sessions.length,
        attendancePresentCount: presentCount,
        materialsTotal: applicableMaterials.length,
        materialsCompleted: completedMaterials,
        forumPostsCount: threadsCount + applicableReplies.length
      }
    };
  }

  /**
   * Get student course-wise breakdown across all enrolled courses
   */
  static async getStudentCourses(studentId) {
    const enrollments = await Enrollment.find({ studentId, status: 'ACTIVE' })
      .populate('courseId', 'title code department thumbnail faculty')
      .lean();

    const courseList = [];

    for (const enr of enrollments) {
      if (!enr.courseId) continue;
      const c = enr.courseId;

      const overview = await this.getStudentOverview(studentId, { courseId: c._id });

      courseList.push({
        courseId: c._id,
        title: c.title,
        code: c.code,
        department: c.department,
        thumbnail: c.thumbnail,
        overallScore: overview.overallScore,
        attendance: overview.attendance,
        quizPerformance: overview.quizPerformance,
        assignmentPerformance: overview.assignmentPerformance,
        learningProgress: overview.learningProgress,
        engagement: overview.engagement,
        metrics: overview.metrics
      });
    }

    // Sort by overallScore descending
    courseList.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
    return courseList;
  }

  /**
   * Get student assessment-based or chronological performance trends
   */
  static async getStudentTrends(studentId, courseId = null) {
    const query = { studentId, status: 'GRADED' };
    if (courseId) {
      query.courseId = courseId;
    }

    const submissions = await Submission.find(query)
      .populate('assessmentId', 'title type totalPoints passingScore createdAt')
      .populate('courseId', 'title code')
      .sort({ submittedAt: 1 })
      .lean();

    if (!submissions.length) {
      return {
        labels: [],
        scores: [],
        items: []
      };
    }

    const labels = [];
    const scores = [];
    const items = [];

    submissions.forEach((sub, index) => {
      const assessmentTitle = sub.assessmentId ? sub.assessmentId.title : `Assessment ${index + 1}`;
      const courseCode = sub.courseId ? sub.courseId.code : '';
      const label = courseCode ? `${courseCode}: ${assessmentTitle}` : assessmentTitle;
      const scoreValue = sub.percentage !== undefined && sub.percentage !== null ? sub.percentage : 0;

      labels.push(label);
      scores.push(scoreValue);
      items.push({
        submissionId: sub._id,
        assessmentTitle,
        type: sub.assessmentId ? sub.assessmentId.type : 'ASSESSMENT',
        courseCode,
        score: sub.score,
        totalPoints: sub.totalPoints,
        percentage: scoreValue,
        isPassed: sub.isPassed,
        submittedAt: sub.submittedAt
      });
    });

    return {
      labels,
      scores,
      items
    };
  }
}

module.exports = StudentAnalyticsService;
