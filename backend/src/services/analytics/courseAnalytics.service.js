const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const Module = require('../../models/Module');
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
const requestCache = require('../../utils/requestCache');

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
   * Get comprehensive list of students in a course with academic breakdown.
   * Batch-optimized: all per-student data is fetched in a handful of
   * course-wide queries instead of N queries per student.
   * Results are memoized per request (overview + departments + roster
   * reuse the same computation with zero cross-request staleness).
   */
  static async getCourseStudents(courseId, options = {}) {
    const { sortBy = 'overallScore', sortOrder = 'desc', search = '' } = options;
    const shortId = String(courseId).slice(-6);
    const cacheKey = `courseStudents:${courseId}:${sortBy}:${sortOrder}:${search}`;
    const cached = requestCache.get(cacheKey);
    if (cached !== undefined) {
      requestCache.mark(`memo-hit:course:${shortId}`);
      return cached;
    }
    const result = await this._getCourseStudentsUncached(courseId, options);
    requestCache.set(cacheKey, result);
    requestCache.mark(`course:${shortId}`);
    return result;
  }

  static async _getCourseStudentsUncached(courseId, options = {}) {
    const { sortBy = 'overallScore', sortOrder = 'desc', search = '' } = options;

    const [course, enrollments] = await Promise.all([
      Course.findById(courseId).lean(),
      Enrollment.find({ courseId, status: 'ACTIVE' })
        .populate('studentId', 'name email department profileImage')
        .lean()
    ]);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const activeEnrollments = enrollments.filter((e) => e.studentId !== null);

    // Get published course items
    const [assignments, quizzes, sessions, modules] = await Promise.all([
      Assessment.find({ courseId, type: 'ASSIGNMENT', isPublished: true }).lean(),
      Assessment.find({ courseId, type: 'QUIZ', isPublished: true }).lean(),
      AttendanceSession.find({ courseId }).lean(),
      Module.find({ courseId, isPublished: true }).select('_id').lean()
    ]);
    // ── Batched course-wide fetches (one wave; materials need modules above) ──
    const studentIds = activeEnrollments.map((e) => e.studentId._id);
    const assignmentIds = assignments.map((a) => a._id);
    const quizIds = quizzes.map((q) => q._id);
    const sessionIds = sessions.map((s) => s._id);
    const [courseMaterials, gradedSubs, attRecords, threadCounts, allReplies] = await Promise.all([
      modules.length
        ? Material.find({ moduleId: { $in: modules.map((m) => m._id) }, isPublished: true }).lean()
        : [],
      assignmentIds.length || quizIds.length
        ? Submission.find({
            courseId,
            studentId: { $in: studentIds },
            assessmentId: { $in: [...assignmentIds, ...quizIds] },
            status: 'GRADED'
          }).lean()
        : [],
      sessionIds.length
        ? AttendanceRecord.find({ courseId, studentId: { $in: studentIds }, sessionId: { $in: sessionIds } }).lean()
        : [],
      Thread.aggregate([
        { $match: { courseId: course._id, authorId: { $in: studentIds } } },
        { $group: { _id: '$authorId', count: { $sum: 1 } } }
      ]),
      Reply.find({ authorId: { $in: studentIds } })
        .populate({ path: 'threadId', match: { courseId }, select: '_id' })
        .lean()
    ]);

    // Progress docs need material IDs from the wave above
    const materialIds = courseMaterials.map((m) => m._id);
    const progressDocs = materialIds.length
      ? await LearningProgress.find({
          courseId,
          studentId: { $in: studentIds },
          materialId: { $in: materialIds },
          completed: true
        }).lean()
      : [];

    const threadsByAuthor = new Map(threadCounts.map((t) => [String(t._id), t.count]));
    const repliesByAuthor = new Map();
    allReplies.forEach((r) => {
      if (!r.threadId) return;
      const key = String(r.authorId);
      if (!repliesByAuthor.has(key)) repliesByAuthor.set(key, []);
      repliesByAuthor.get(key).push(r);
    });

    const students = [];

    for (const enr of activeEnrollments) {
      const student = enr.studentId;
      const studentId = student._id;
      const sidKey = String(studentId);

      // Filter by search if provided
      if (search) {
        const term = search.toLowerCase();
        const matchesName = student.name && student.name.toLowerCase().includes(term);
        const matchesEmail = student.email && student.email.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail) continue;
      }

      const mySubs = gradedSubs.filter((s) => String(s.studentId) === sidKey);

      // 1. Assignment Score
      let assignmentScore = null;
      if (assignments.length > 0) {
        let totalEarned = 0;
        let totalAvailable = 0;
        assignments.forEach((assign) => {
          const sub = mySubs.find((s) => String(s.assessmentId) === String(assign._id));
          if (sub) {
            totalEarned += (sub.score || 0);
            totalAvailable += (sub.totalPoints || assign.totalPoints || 100);
          } else {
            totalAvailable += (assign.totalPoints || 100);
          }
        });
        assignmentScore = safePercentage(totalEarned, totalAvailable);
      }

      // 2. Quiz Score (best attempt per quiz)
      let quizScore = null;
      if (quizzes.length > 0) {
        const bestAttempts = new Map();
        mySubs.forEach((sub) => {
          if (!quizIds.some((id) => String(id) === String(sub.assessmentId))) return;
          const aId = String(sub.assessmentId);
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
        const records = attRecords.filter((r) => String(r.studentId) === sidKey);
        const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
        attendancePercentage = safePercentage(presentCount, sessions.length);
      }

      // 4. Learning Progress
      let learningProgress = null;
      if (courseMaterials.length > 0) {
        const mine = progressDocs.filter((p) => String(p.studentId) === sidKey);
        learningProgress = safePercentage(mine.length, courseMaterials.length);
      }

      // 5. Engagement
      const threadsCount = threadsByAuthor.get(sidKey) || 0;
      const applicableReplies = repliesByAuthor.get(sidKey) || [];
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
