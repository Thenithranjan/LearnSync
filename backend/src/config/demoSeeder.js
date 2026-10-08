const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * Demo Data Seeder.
 * Ensures default demonstration accounts, courses, and student enrollments exist.
 */
async function seedDemoData() {
  try {
    const demoAccounts = [
      {
        name: 'John Student',
        email: 'student@example.com',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Computer Science'
      },
      {
        name: 'Dr. Alan Faculty',
        email: 'faculty@example.com',
        password: 'Password123!',
        role: 'FACULTY',
        department: 'Computer Science'
      },
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'ADMIN',
        department: 'Administration'
      }
    ];

    const users = {};
    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = await User.create(acc);
        console.log(`[Seed] Created demo account: ${acc.email} (${acc.role})`);
      }
      users[acc.role] = user;
    }

    // Seed default courses if empty
    const demoCourses = [
      {
        title: 'Data Structures & Algorithms',
        code: 'CS201',
        description: 'Core fundamental algorithms, binary trees, dynamic programming, and complexity analysis.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      },
      {
        title: 'Database Management Systems',
        code: 'CS301',
        description: 'Relational data models, normalization, SQL, indexing, and NoSQL architecture.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      },
      {
        title: 'Computer Networks',
        code: 'CS401',
        description: 'TCP/IP protocol suite, routing protocols, flow control, and network security.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      }
    ];

    for (const c of demoCourses) {
      let course = await Course.findOne({ code: c.code });
      if (!course) {
        course = await Course.create(c);
        console.log(`[Seed] Created demo course: ${c.code} - ${c.title}`);
      }

      // Automatically enroll John Student in these courses
      if (users['STUDENT'] && course) {
        const enrolled = await Enrollment.findOne({ studentId: users['STUDENT']._id, courseId: course._id });
        if (!enrolled) {
          await Enrollment.create({
            studentId: users['STUDENT']._id,
            courseId: course._id,
            status: 'ACTIVE'
          });
          console.log(`[Seed] Enrolled student in ${course.code}`);
        }
      }

      // Seed initial sample assessments (Assignment & Quiz)
      const Assessment = require('../models/Assessment');
      const existingAssessments = await Assessment.find({ courseId: course._id });
      if (existingAssessments.length === 0) {
        await Assessment.create([
          {
            title: `${course.code} Problem Set 1`,
            description: `Core practical assignment covering key topics of ${course.title}.`,
            type: 'ASSIGNMENT',
            courseId: course._id,
            facultyId: users['FACULTY']._id,
            totalPoints: 100,
            passingScore: 50,
            dueDate: new Date(Date.now() + 7 * 86400000),
            isPublished: true
          },
          {
            title: `${course.code} Concept Evaluation Quiz`,
            description: `Quick diagnostic quiz on fundamentals of ${course.title}.`,
            type: 'QUIZ',
            courseId: course._id,
            facultyId: users['FACULTY']._id,
            totalPoints: 50,
            passingScore: 25,
            dueDate: new Date(Date.now() + 3 * 86400000),
            isPublished: true,
            questions: [
              {
                questionText: `Which fundamental principle applies to ${course.title}?`,
                options: ['Decomposition & modularity', 'Random search', 'Ignoring base cases', 'Hardcoded values'],
                correctOptionIndex: 0,
                points: 25,
                topic: 'Fundamentals'
              },
              {
                questionText: 'What is the standard optimal evaluation measure?',
                options: ['O(1) or O(log n)', 'Exponential complexity', 'Infinite loop', 'Unbounded recursion'],
                correctOptionIndex: 0,
                points: 25,
                topic: 'Efficiency'
              }
            ]
          }
        ]);
        console.log(`[Seed] Created demo assessments for ${course.code}`);
      }

      // Seed an active attendance session for check-in demo
      const AttendanceSession = require('../models/AttendanceSession');
      const activeSession = await AttendanceSession.findOne({ courseId: course._id, isOtpActive: true });
      if (!activeSession) {
        await AttendanceSession.create({
          courseId: course._id,
          facultyId: users['FACULTY']._id,
          title: `${course.code} Lecture: Deep Dive`,
          date: new Date(),
          sessionType: 'LECTURE',
          otpCode: '849201',
          isOtpActive: true,
          otpExpiresAt: new Date(Date.now() + 86400000),
          status: 'ACTIVE'
        });
        console.log(`[Seed] Created active attendance session for ${course.code} with OTP 849201`);
      }
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not seed default demo accounts: ${err.message}`);
  }
}

module.exports = seedDemoData;


