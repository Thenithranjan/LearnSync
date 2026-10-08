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
        status: 'PUBLISHED'
      },
      {
        title: 'Database Management Systems',
        code: 'CS301',
        description: 'Relational data models, normalization, SQL, indexing, and NoSQL architecture.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        status: 'PUBLISHED'
      },
      {
        title: 'Computer Networks',
        code: 'CS401',
        description: 'TCP/IP protocol suite, routing protocols, flow control, and network security.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
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
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not seed default demo accounts: ${err.message}`);
  }
}

module.exports = seedDemoData;


