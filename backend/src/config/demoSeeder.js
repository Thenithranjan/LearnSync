const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');

/**
 * Seed comprehensive 20-student demo dataset for Attendance, Analytics & Intelligence
 */
async function seedDemoData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] 🚀 Seeding 20-student EduPulse demo dataset...');

    // 1. Create Core Staff Accounts
    const faculty = await User.create({
      name: 'Dr. Alan Faculty',
      email: 'faculty@example.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Administration'
    });

    // 2. Create 20 Student Accounts
    const studentProfiles = [
      { name: 'John Student', email: 'student@example.com', pattern: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] }, // 90%
      { name: 'Aarav Sharma', email: 'student1@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, // 100%
      { name: 'Aditi Patel', email: 'student2@example.com', pattern: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1] }, // 90%
      { name: 'Ananya Verma', email: 'student3@example.com', pattern: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1] }, // 80%
      { name: 'Arjun Gupta', email: 'student4@example.com', pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] }, // 50% (At Risk)
      { name: 'Bhavya Nair', email: 'student5@example.com', pattern: [1, 1, 1, 1, 1, 0, 1, 1, 1, 1] }, // 90%
      { name: 'Devansh Kumar', email: 'student6@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, // 100%
      { name: 'Diya Reddy', email: 'student7@example.com', pattern: [0, 1, 0, 1, 0, 1, 0, 1, 1, 0] }, // 50% (At Risk)
      { name: 'Ishan Joshi', email: 'student8@example.com', pattern: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1] }, // 80%
      { name: 'Kavya Singh', email: 'student9@example.com', pattern: [1, 1, 1, 1, 1, 1, 0, 1, 1, 1] }, // 90%
      { name: 'Manish Rao', email: 'student10@example.com', pattern: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0] }, // 60% (At Risk)
      { name: 'Neha Choudhury', email: 'student11@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, // 100%
      { name: 'Pranav Iyer', email: 'student12@example.com', pattern: [1, 1, 1, 1, 1, 0, 1, 1, 1, 1] }, // 90%
      { name: 'Priya Saxena', email: 'student13@example.com', pattern: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1] }, // 80%
      { name: 'Rahul Mehta', email: 'student14@example.com', pattern: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1] }, // 40% (At Risk)
      { name: 'Riya Banerjee', email: 'student15@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 0, 1, 1] }, // 90%
      { name: 'Rohan Deshmukh', email: 'student16@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, // 100%
      { name: 'Siddharth Kapoor', email: 'student17@example.com', pattern: [1, 0, 1, 1, 1, 1, 1, 0, 1, 1] }, // 80%
      { name: 'Sneha Agarwal', email: 'student18@example.com', pattern: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] }, // 90%
      { name: 'Tanvi Bhatt', email: 'student19@example.com', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] } // 100%
    ];

    const studentDocs = [];
    for (const sp of studentProfiles) {
      const stu = await User.create({
        name: sp.name,
        email: sp.email,
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Computer Science'
      });
      studentDocs.push({ doc: stu, pattern: sp.pattern });
    }

    // 3. Create Demo Course
    const course = await Course.create({
      title: 'CS201: Data Structures & Algorithms',
      code: 'CS201',
      description: 'Foundational study of arrays, linked lists, trees, graphs, and algorithm optimization.',
      department: 'Computer Science',
      status: 'PUBLISHED',
      facultyId: faculty._id,
      createdBy: admin._id
    });

    // 4. Enroll all 20 students in CS201
    for (const s of studentDocs) {
      await Enrollment.create({
        studentId: s.doc._id,
        courseId: course._id,
        status: 'ACTIVE'
      });
    }

    // 5. Create 10 Attendance Sessions
    const sessionTitles = [
      'Lecture 1: Introduction to Data Structures & Complexity',
      'Lecture 2: Memory Allocation & Dynamic Arrays',
      'Lecture 3: Linked Lists & Pointer Manipulations',
      'Lecture 4: Stacks, Queues & Expression Evaluation',
      'Lecture 5: Recursion, Divide & Conquer',
      'Lecture 6: Binary Trees & Traversal Algorithms',
      'Lecture 7: Binary Search Trees & Balancing',
      'Lecture 8: Priority Queues & Binary Heaps',
      'Lecture 9: Graph Representations & Adjacency Lists',
      'Lecture 10: Breadth-First & Depth-First Search'
    ];

    const sessionDocs = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30); // 30 days ago

    for (let i = 0; i < sessionTitles.length; i++) {
      const sessDate = new Date(baseDate);
      sessDate.setDate(sessDate.getDate() + i * 3);

      const session = await AttendanceSession.create({
        courseId: course._id,
        facultyId: faculty._id,
        title: sessionTitles[i],
        date: sessDate,
        sessionType: i % 3 === 1 ? 'LAB' : 'LECTURE',
        status: 'CLOSED'
      });
      sessionDocs.push(session);
    }

    // 6. Record Attendance for all 20 Students across all 10 Sessions
    for (let sessIdx = 0; sessIdx < sessionDocs.length; sessIdx++) {
      const sess = sessionDocs[sessIdx];
      for (const s of studentDocs) {
        const isPresent = s.pattern[sessIdx] === 1;
        await AttendanceRecord.create({
          sessionId: sess._id,
          courseId: course._id,
          studentId: s.doc._id,
          status: isPresent ? 'PRESENT' : 'ABSENT',
          markedBy: 'FACULTY'
        });
      }
    }

    console.log('[Seed] ✅ Demo data successfully created!');
    console.log('       👩‍🎓 20 Students Enrolled in CS201');
    console.log('       👨‍🏫 Faculty: faculty@example.com / Password123!');
    console.log('       👩‍🎓 Student: student@example.com / Password123!');
    console.log('       🛡️ Admin:   admin@example.com   / Password123!');
    console.log('       📊 10 Attendance Sessions & 200 Attendance Records Generated.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed demo dataset:', error.message);
  }
}

module.exports = seedDemoData;
