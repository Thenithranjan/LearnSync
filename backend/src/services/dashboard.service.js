const mongoose = require('mongoose');
const requestCache = require('../utils/requestCache');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const AttendanceRecord = require('../models/AttendanceRecord');
const Intervention = require('../models/Intervention');
const StudentAnalyticsService = require('./analytics/studentAnalytics.service');
const FacultyAnalyticsService = require('./analytics/facultyAnalytics.service');
const AdminAnalyticsService = require('./analytics/adminAnalytics.service');
const CourseAnalyticsService = require('./analytics/courseAnalytics.service');
const TopicAnalyticsService = require('./analytics/topicAnalytics.service');
const InterventionAnalyticsService = require('./interventions/interventionAnalytics.service');

const ACTIVE_INTERVENTION_STATUSES = ['PENDING', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'OVERDUE'];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function lastNMonthLabels(n = 6) {
  const labels = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({
      key: monthKey(d),
      label: d.toLocaleString('en-US', { month: 'short' })
    });
  }
  return labels;
}

class DashboardService {
  // ─── Student ──────────────────────────────────────────────
  static async getStudentDashboard(studentId) {
    const [overview, courses, trends, topics, interventions] = await Promise.all([
      StudentAnalyticsService.getStudentOverview(studentId),
      StudentAnalyticsService.getStudentCourses(studentId),
      StudentAnalyticsService.getStudentTrends(studentId),
      TopicAnalyticsService.getStudentTopicAnalytics(studentId),
      Intervention.find({ studentId, status: { $in: ACTIVE_INTERVENTION_STATUSES } })
        .populate('courseId', 'title code')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()
    ]);

    const topicsNeedingWork = (topics || [])
      .filter((t) => t.accuracy !== null && t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Performance trend shaped for the frontend chart ({ week/score/avg })
    const performanceTrend = (trends.items || []).slice(-10).map((item, i) => ({
      week: item.assessmentTitle
        ? item.assessmentTitle.slice(0, 14)
        : `A${i + 1}`,
      score: item.percentage ?? 0,
      avg: null
    }));

    // Recent activity: latest graded submissions + interventions
    const recentSubmissions = await Submission.find({ studentId })
      .populate('assessmentId', 'title type')
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = [
      ...recentSubmissions.map((s) => ({
        type: s.status === 'GRADED' ? 'success' : 'info',
        text: `${s.status === 'GRADED' ? 'Graded' : 'Submitted'}: ${s.assessmentId?.title || 'Assessment'}${s.percentage != null && s.status === 'GRADED' ? ` — ${s.percentage}%` : ''}`,
        time: s.submittedAt
      })),
      ...interventions.slice(0, 3).map((iv) => ({
        type: 'warning',
        text: `Intervention: ${iv.title} (${iv.status})`,
        time: iv.updatedAt
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    // Attendance streak: consecutive PRESENT/LATE records (most recent first)
    const attendanceRecords = await AttendanceRecord.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    let streak = 0;
    for (const r of attendanceRecords) {
      if (r.status === 'PRESENT' || r.status === 'LATE') streak++;
      else break;
    }

    return {
      overview,
      courses,
      performanceTrend,
      topicsNeedingWork,
      activeInterventions: interventions.map((iv) => ({
        id: iv._id,
        title: iv.title,
        status: iv.status,
        priority: iv.priority,
        course: iv.courseId ? { title: iv.courseId.title, code: iv.courseId.code } : null,
        dueDate: iv.dueDate
      })),
      activeInterventionsCount: await Intervention.countDocuments({
        studentId,
        status: { $in: ACTIVE_INTERVENTION_STATUSES }
      }),
      streak,
      recentActivity
    };
  }

  // ─── Faculty ──────────────────────────────────────────────
  static async getFacultyDashboard(facultyId) {
    const overview = await FacultyAnalyticsService.getFacultyOverview(facultyId);

    const facultyCourses = await Course.find({ faculty: facultyId }).select('_id').lean();
    const courseIds = facultyCourses.map((c) => c._id);

    let pendingReviews = 0;
    let scoreDistribution = [];
    let atRiskStudents = [];
    if (courseIds.length) {
      const [pending, allStudentsData] = await Promise.all([
        Submission.countDocuments({ courseId: { $in: courseIds }, status: 'SUBMITTED' }),
        Promise.all(courseIds.slice(0, 5).map((id) => CourseAnalyticsService.getCourseStudents(id)))
      ]);
      pendingReviews = pending;

      // Score distribution buckets across faculty courses
      const buckets = [
        { range: '0-40', count: 0 },
        { range: '40-55', count: 0 },
        { range: '55-70', count: 0 },
        { range: '70-85', count: 0 },
        { range: '85-100', count: 0 }
      ];
      const seen = new Set();
      allStudentsData.forEach((d) => {
        (d.students || []).forEach((s) => {
          if (s.overallScore === null || s.overallScore === undefined) return;
          // Dedupe students enrolled in multiple faculty courses
          const key = String(s.studentId);
          const bucketIdx =
            s.overallScore < 40 ? 0
            : s.overallScore < 55 ? 1
            : s.overallScore < 70 ? 2
            : s.overallScore < 85 ? 3 : 4;
          // Count once per student using their lowest score (most at-risk view)
          if (!seen.has(key)) {
            seen.add(key);
            buckets[bucketIdx].count++;
          }
        });
      });
      scoreDistribution = buckets;

      // At-risk = low score (<60) or low attendance (<75), top 10
      const riskMap = new Map();
      allStudentsData.forEach((d, ci) => {
        (d.students || []).forEach((s) => {
          const lowScore = s.overallScore !== null && s.overallScore < 60;
          const lowAtt = s.attendance !== null && s.attendance < 75;
          if (!(lowScore || lowAtt)) return;
          const key = String(s.studentId);
          if (!riskMap.has(key)) {
            riskMap.set(key, {
              id: s.studentId,
              name: s.name,
              email: s.email,
              roll: s.email ? s.email.split('@')[0] : '',
              course: d.courseCode || '',
              score: s.overallScore,
              attendance: s.attendance,
              risk: lowScore && lowAtt ? 'high' : 'high'
            });
          }
        });
      });
      atRiskStudents = [...riskMap.values()]
        .sort((a, b) => (a.score ?? 999) - (b.score ?? 999))
        .slice(0, 10);
    }

    const recentInterventions = await Intervention.find({
      assignedFaculty: facultyId
    })
      .populate('studentId', 'name email')
      .populate('courseId', 'title code')
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    const myStudents = overview.totalStudents || 0;

    return {
      overview,
      kpis: {
        myStudents,
        atRiskCount: atRiskStudents.length,
        avgClassScore: overview.averagePerformance,
        pendingReviews
      },
      scoreDistribution,
      atRiskStudents,
      recentInterventions: recentInterventions.map((iv) => ({
        id: iv._id,
        title: iv.title,
        status: iv.status,
        priority: iv.priority,
        student: iv.studentId ? { name: iv.studentId.name, email: iv.studentId.email } : null,
        course: iv.courseId ? { title: iv.courseId.title, code: iv.courseId.code } : null,
        updatedAt: iv.updatedAt
      }))
    };
  }

  // ─── Admin ────────────────────────────────────────────────
  static async getAdminDashboard() {
    // Overview + intervention stats are independent — run together.
    // Departments runs AFTER: it reuses the per-course scans the overview
    // just memoized instead of recomputing them concurrently.
    const [overview, interventionStats] = await Promise.all([
      AdminAnalyticsService.getAdminOverview(),
      InterventionAnalyticsService.getAdminInterventionAnalytics()
    ]);
    requestCache.mark('dash:overview+stats');

    const departments = await AdminAnalyticsService.getDepartmentAnalytics();
    requestCache.mark('dash:departments');

    // All independent tail queries in one wave (was 7 sequential round trips)
    const [
      atRiskAgg,
      studentSignups,
      interventionByMonth,
      reviewedByMonth,
      alertDocs,
      topAgg,
      totalAssessments,
      totalEnrollments
    ] = await Promise.all([
      Intervention.aggregate([
        { $match: { status: { $in: ACTIVE_INTERVENTION_STATUSES } } },
        { $group: { _id: '$studentId' } },
        { $count: 'count' }
      ]),
      User.aggregate([
        { $match: { role: 'STUDENT' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }
      ]),
      Intervention.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }
      ]),
      Intervention.aggregate([
        { $match: { status: { $in: ['COMPLETED', 'REVIEWED'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }, success: { $sum: 1 } } }
      ]),
      Intervention.find({
        $or: [{ priority: { $in: ['HIGH', 'CRITICAL'] } }, { status: 'OVERDUE' }]
      })
        .populate('courseId', 'department title')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
      Intervention.aggregate([
        { $group: { _id: '$assignedFaculty', interventions: { $sum: 1 } } },
        { $sort: { interventions: -1 } },
        { $limit: 5 }
      ]),
      Assessment.countDocuments({ isPublished: true }),
      Enrollment.countDocuments({ status: 'ACTIVE' })
    ]);
    requestCache.mark('dash:tail-queries');

    // At-risk proxy: distinct students with active interventions
    const atRiskStudents = atRiskAgg.length ? atRiskAgg[0].count : 0;

    const openInterventions =
      (interventionStats.statusSummary?.PENDING || 0) +
      (interventionStats.statusSummary?.ASSIGNED || 0) +
      (interventionStats.statusSummary?.ACKNOWLEDGED || 0) +
      (interventionStats.statusSummary?.IN_PROGRESS || 0) +
      (interventionStats.statusSummary?.OVERDUE || 0);
    const resolvedInterventions =
      (interventionStats.statusSummary?.COMPLETED || 0) +
      (interventionStats.statusSummary?.REVIEWED || 0);
    const interventionRate =
      interventionStats.totalInterventions > 0
        ? Number(((resolvedInterventions / interventionStats.totalInterventions) * 100).toFixed(1))
        : null;

    // Enrollment & risk trend: last 6 months of student signups + active interventions
    const months = lastNMonthLabels(6);
    const signupMap = new Map(studentSignups.map((s) => [s._id, s.count]));
    const ivMap = new Map(interventionByMonth.map((s) => [s._id, s.count]));
    const enrollmentTrend = months.map((m) => ({
      month: m.label,
      active: signupMap.get(m.key) || 0,
      atRisk: ivMap.get(m.key) || 0
    }));

    // Intervention outcomes by month (resolved vs pending)
    const reviewedMap = new Map(reviewedByMonth.map((s) => [s._id, s.success]));
    const interventionOutcomes = months.map((m) => ({
      month: m.label,
      success: reviewedMap.get(m.key) || 0,
      pending: ivMap.get(m.key) || 0
    }));

    // System alerts: latest high-priority / overdue interventions
    const recentAlerts = alertDocs.map((iv) => ({
      id: iv._id,
      type: iv.priority === 'CRITICAL' || iv.status === 'OVERDUE' ? 'critical' : 'warning',
      message: `${iv.title} — ${iv.status}`,
      dept: iv.courseId?.department || 'General',
      time: iv.updatedAt
    }));

    // Top interveners: faculty with most interventions + success rate
    const topInterveners = await Promise.all(
      topAgg.map(async (row) => {
        const [faculty, reviewed] = await Promise.all([
          row._id ? User.findById(row._id).select('name department').lean() : null,
          Intervention.countDocuments({
            assignedFaculty: row._id,
            status: { $in: ['COMPLETED', 'REVIEWED'] }
          })
        ]);
        return {
          name: faculty?.name || 'Unknown Faculty',
          dept: faculty?.department || 'General',
          interventions: row.interventions,
          successRate: row.interventions > 0 ? Math.round((reviewed / row.interventions) * 100) : 0
        };
      })
    );
    requestCache.mark('dash:interveners');

    return {
      kpis: {
        totalStudents: overview.totalStudents,
        totalFaculty: overview.totalFaculty,
        totalCourses: overview.totalCourses,
        totalEnrollments,
        totalAssessments,
        atRiskStudents,
        avgPerformance: overview.averagePerformance,
        avgAttendance: overview.averageAttendance,
        interventionRate,
        totalInterventions: interventionStats.totalInterventions,
        openInterventions,
        resolvedInterventions,
        overallEffectiveness: interventionStats.overallEffectiveness
      },
      overview,
      departments,
      enrollmentTrend,
      interventionOutcomes,
      recentAlerts,
      topInterveners,
      interventionStats
    };
  }
}

module.exports = DashboardService;
