const Course = require('../../models/Course');
const CourseAnalyticsService = require('./courseAnalytics.service');

class FacultyAnalyticsService {
  /**
   * Get faculty overview aggregating all courses assigned to this faculty member
   */
  static async getFacultyOverview(facultyId) {
    const courses = await Course.find({
      faculty: facultyId,
      status: { $in: ['PUBLISHED', 'DRAFT'] }
    }).lean();

    if (!courses.length) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        averagePerformance: null,
        averageAttendance: null,
        averageQuizScore: null,
        averageAssignment: null,
        averageProgress: null,
        courses: []
      };
    }

    let totalEnrolledAcrossAll = 0;
    const courseSummaries = [];

    let sumOverall = 0, countOverall = 0;
    let sumAttendance = 0, countAttendance = 0;
    let sumQuiz = 0, countQuiz = 0;
    let sumAssignment = 0, countAssignment = 0;
    let sumProgress = 0, countProgress = 0;

    for (const c of courses) {
      const studentData = await CourseAnalyticsService.getCourseStudents(c._id);
      const students = studentData.students;

      totalEnrolledAcrossAll += studentData.totalEnrolled;

      // Compute course averages
      const validOverall = students.map((s) => s.overallScore).filter((v) => v !== null);
      const validAttendance = students.map((s) => s.attendance).filter((v) => v !== null);
      const validQuiz = students.map((s) => s.quizPerformance).filter((v) => v !== null);
      const validAssign = students.map((s) => s.assignmentPerformance).filter((v) => v !== null);
      const validProgress = students.map((s) => s.learningProgress).filter((v) => v !== null);

      const avgCourseOverall = validOverall.length
        ? Number((validOverall.reduce((a, b) => a + b, 0) / validOverall.length).toFixed(1))
        : null;
      const avgCourseAttendance = validAttendance.length
        ? Number((validAttendance.reduce((a, b) => a + b, 0) / validAttendance.length).toFixed(1))
        : null;
      const avgCourseQuiz = validQuiz.length
        ? Number((validQuiz.reduce((a, b) => a + b, 0) / validQuiz.length).toFixed(1))
        : null;
      const avgCourseAssign = validAssign.length
        ? Number((validAssign.reduce((a, b) => a + b, 0) / validAssign.length).toFixed(1))
        : null;
      const avgCourseProgress = validProgress.length
        ? Number((validProgress.reduce((a, b) => a + b, 0) / validProgress.length).toFixed(1))
        : null;

      if (avgCourseOverall !== null) { sumOverall += avgCourseOverall; countOverall++; }
      if (avgCourseAttendance !== null) { sumAttendance += avgCourseAttendance; countAttendance++; }
      if (avgCourseQuiz !== null) { sumQuiz += avgCourseQuiz; countQuiz++; }
      if (avgCourseAssign !== null) { sumAssignment += avgCourseAssign; countAssignment++; }
      if (avgCourseProgress !== null) { sumProgress += avgCourseProgress; countProgress++; }

      courseSummaries.push({
        courseId: c._id,
        title: c.title,
        code: c.code,
        department: c.department,
        status: c.status,
        totalEnrolled: studentData.totalEnrolled,
        averagePerformance: avgCourseOverall,
        averageAttendance: avgCourseAttendance,
        averageQuizScore: avgCourseQuiz,
        averageAssignment: avgCourseAssign,
        averageProgress: avgCourseProgress
      });
    }

    return {
      totalCourses: courses.length,
      totalStudents: totalEnrolledAcrossAll,
      averagePerformance: countOverall ? Number((sumOverall / countOverall).toFixed(1)) : null,
      averageAttendance: countAttendance ? Number((sumAttendance / countAttendance).toFixed(1)) : null,
      averageQuizScore: countQuiz ? Number((sumQuiz / countQuiz).toFixed(1)) : null,
      averageAssignment: countAssignment ? Number((sumAssignment / countAssignment).toFixed(1)) : null,
      averageProgress: countProgress ? Number((sumProgress / countProgress).toFixed(1)) : null,
      courses: courseSummaries
    };
  }
}

module.exports = FacultyAnalyticsService;
