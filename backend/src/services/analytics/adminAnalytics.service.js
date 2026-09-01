const User = require('../../models/User');
const Course = require('../../models/Course');
const CourseAnalyticsService = require('./courseAnalytics.service');

class AdminAnalyticsService {
  /**
   * Get institution-wide overview metrics
   */
  static async getAdminOverview() {
    const totalStudents = await User.countDocuments({ role: 'STUDENT', isActive: true });
    const totalFaculty = await User.countDocuments({ role: 'FACULTY', isActive: true });
    const totalCourses = await Course.countDocuments({ status: { $in: ['PUBLISHED', 'DRAFT'] } });

    const courses = await Course.find({ status: 'PUBLISHED' }).lean();

    let sumOverall = 0, countOverall = 0;
    let sumAttendance = 0, countAttendance = 0;
    let sumQuiz = 0, countQuiz = 0;
    let sumAssignment = 0, countAssignment = 0;
    let sumProgress = 0, countProgress = 0;

    const coursePerformances = [];

    for (const c of courses) {
      const studentData = await CourseAnalyticsService.getCourseStudents(c._id);
      const students = studentData.students;

      const validOverall = students.map((s) => s.overallScore).filter((v) => v !== null);
      const validAttendance = students.map((s) => s.attendance).filter((v) => v !== null);
      const validQuiz = students.map((s) => s.quizPerformance).filter((v) => v !== null);
      const validAssign = students.map((s) => s.assignmentPerformance).filter((v) => v !== null);
      const validProgress = students.map((s) => s.learningProgress).filter((v) => v !== null);

      const avgOverall = validOverall.length
        ? Number((validOverall.reduce((a, b) => a + b, 0) / validOverall.length).toFixed(1))
        : null;
      const avgAttendance = validAttendance.length
        ? Number((validAttendance.reduce((a, b) => a + b, 0) / validAttendance.length).toFixed(1))
        : null;
      const avgQuiz = validQuiz.length
        ? Number((validQuiz.reduce((a, b) => a + b, 0) / validQuiz.length).toFixed(1))
        : null;
      const avgAssign = validAssign.length
        ? Number((validAssign.reduce((a, b) => a + b, 0) / validAssign.length).toFixed(1))
        : null;
      const avgProgress = validProgress.length
        ? Number((validProgress.reduce((a, b) => a + b, 0) / validProgress.length).toFixed(1))
        : null;

      if (avgOverall !== null) { sumOverall += avgOverall; countOverall++; }
      if (avgAttendance !== null) { sumAttendance += avgAttendance; countAttendance++; }
      if (avgQuiz !== null) { sumQuiz += avgQuiz; countQuiz++; }
      if (avgAssign !== null) { sumAssignment += avgAssign; countAssignment++; }
      if (avgProgress !== null) { sumProgress += avgProgress; countProgress++; }

      coursePerformances.push({
        courseId: c._id,
        title: c.title,
        code: c.code,
        department: c.department,
        totalEnrolled: studentData.totalEnrolled,
        averagePerformance: avgOverall,
        averageAttendance: avgAttendance
      });
    }

    return {
      totalStudents,
      totalFaculty,
      totalCourses,
      averagePerformance: countOverall ? Number((sumOverall / countOverall).toFixed(1)) : null,
      averageAttendance: countAttendance ? Number((sumAttendance / countAttendance).toFixed(1)) : null,
      averageQuizPerformance: countQuiz ? Number((sumQuiz / countQuiz).toFixed(1)) : null,
      averageAssignmentPerformance: countAssignment ? Number((sumAssignment / countAssignment).toFixed(1)) : null,
      averageLearningProgress: countProgress ? Number((sumProgress / countProgress).toFixed(1)) : null,
      courses: coursePerformances
    };
  }

  /**
   * Get department-level analytics dynamically from real database entities
   */
  static async getDepartmentAnalytics() {
    const courses = await Course.find({ status: { $in: ['PUBLISHED', 'DRAFT'] } }).lean();
    const students = await User.find({ role: 'STUDENT', isActive: true }).lean();

    const deptMap = new Map();

    // Initialize departments from users
    students.forEach((s) => {
      const dept = s.department && s.department.trim() ? s.department.trim() : 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          studentCount: 0,
          courseCount: 0,
          courseIds: [],
          scores: [],
          attendances: []
        });
      }
      deptMap.get(dept).studentCount++;
    });

    // Add courses to departments
    courses.forEach((c) => {
      const dept = c.department && c.department.trim() ? c.department.trim() : 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          studentCount: 0,
          courseCount: 0,
          courseIds: [],
          scores: [],
          attendances: []
        });
      }
      const data = deptMap.get(dept);
      data.courseCount++;
      data.courseIds.push(c._id);
    });

    // Calculate department averages
    for (const [dept, data] of deptMap.entries()) {
      for (const courseId of data.courseIds) {
        const studentData = await CourseAnalyticsService.getCourseStudents(courseId);
        studentData.students.forEach((s) => {
          if (s.overallScore !== null) data.scores.push(s.overallScore);
          if (s.attendance !== null) data.attendances.push(s.attendance);
        });
      }
    }

    const results = [];
    for (const [dept, data] of deptMap.entries()) {
      const avgScore = data.scores.length
        ? Number((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1))
        : null;
      const avgAttend = data.attendances.length
        ? Number((data.attendances.reduce((a, b) => a + b, 0) / data.attendances.length).toFixed(1))
        : null;

      results.push({
        department: dept,
        studentCount: data.studentCount,
        courseCount: data.courseCount,
        averagePerformance: avgScore,
        averageAttendance: avgAttend
      });
    }

    results.sort((a, b) => (b.averagePerformance || 0) - (a.averagePerformance || 0));
    return results;
  }
}

module.exports = AdminAnalyticsService;
