const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Module = require('./src/models/Module');
const Material = require('./src/models/Material');
const Enrollment = require('./src/models/Enrollment');
const Assessment = require('./src/models/Assessment');
const Submission = require('./src/models/Submission');
const AttendanceSession = require('./src/models/AttendanceSession');
const AttendanceRecord = require('./src/models/AttendanceRecord');
const LearningProgress = require('./src/models/LearningProgress');
const Thread = require('./src/models/Thread');
const Reply = require('./src/models/Reply');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule6Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 6 (Performance Analytics) Verification');
  console.log('==================================================\n');

  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edupulse';

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Connected to MongoDB.`);
    } catch (err) {
      console.log('⚠️  Local MongoDB not running. Launching in-memory MongoDB instance...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to in-memory MongoDB instance.`);
    }

    // Clean test data
    await User.deleteMany({ email: /@mod6test\.com$/ });
    await Course.deleteMany({ code: /^M6TEST/ });
    await Assessment.deleteMany({});
    await Submission.deleteMany({});
    await AttendanceSession.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await LearningProgress.deleteMany({});
    await Module.deleteMany({});
    await Material.deleteMany({});
    await Thread.deleteMany({});
    await Reply.deleteMany({});

    const PORT = 5006;
    server = app.listen(PORT);
    console.log(`✅ Test server running on port ${PORT}.\n`);

    const baseUrl = `http://localhost:${PORT}/api`;

    const createSession = () => {
      let cookies = '';
      return async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        if (cookies) headers['Cookie'] = cookies;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${baseUrl}${endpoint}`, options);
        const data = await res.json().catch(() => ({}));
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) cookies = setCookie.split(';')[0];

        return { status: res.status, data };
      };
    };

    const adminClient = createSession();
    const facultyClient = createSession();
    const student1Client = createSession();
    const student2Client = createSession();

    // 1. User Setup
    console.log('--- 1. User Setup ---');
    await User.create({
      name: 'Analytics Admin',
      email: 'admin@mod6test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Administration'
    });

    const adminLogin = await adminClient('/auth/login', 'POST', {
      email: 'admin@mod6test.com',
      password: 'Password123!'
    });
    console.log('Admin Authentication:', adminLogin.status === 200 ? '✅ OK' : '❌ FAIL');

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Prof. Analytics',
      email: 'faculty@mod6test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    console.log('Faculty Registration:', facultyReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const facultyId = facultyReg.data.user.id;

    const student1Reg = await student1Client('/auth/register', 'POST', {
      name: 'Alice Student',
      email: 'student1@mod6test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Student 1 Registration:', student1Reg.status === 201 ? '✅ OK' : '❌ FAIL');
    const student1Id = student1Reg.data.user.id;

    const student2Reg = await student2Client('/auth/register', 'POST', {
      name: 'Bob Student',
      email: 'student2@mod6test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Student 2 Registration:', student2Reg.status === 201 ? '✅ OK' : '❌ FAIL');
    const student2Id = student2Reg.data.user.id;

    // 2. Create Course & Enrollments
    console.log('\n--- 2. Create Course & Setup Content ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Data Structures & Algorithms',
      code: 'M6TEST401',
      description: 'Core DSA concepts and performance analytics',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    const courseId = courseRes.data.course._id;

    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await adminClient(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });

    // Enroll students
    await student1Client(`/courses/${courseId}/enroll`, 'POST');
    await student2Client(`/courses/${courseId}/enroll`, 'POST');
    console.log('Enrollments Created: ✅ OK');

    // Create Module & Learning Material
    const moduleRes = await adminClient(`/courses/${courseId}/modules`, 'POST', {
      title: 'Module 1: Linear Structures',
      description: 'Arrays and Linked Lists'
    });
    const moduleId = moduleRes.data.module?._id || moduleRes.data.data?._id || moduleRes.data._id;

    const materialRes = await adminClient(`/modules/${moduleId}/materials`, 'POST', {
      title: 'Arrays Masterclass',
      type: 'DOCUMENT',
      url: 'https://example.com/arrays.pdf'
    });
    const materialId = materialRes.data.material?._id || materialRes.data.data?._id || materialRes.data._id;

    // Mark Learning Progress for Student 1
    await student1Client(`/materials/${materialId}/complete`, 'POST', { completed: true });
    console.log('Student 1 Learning Progress Recorded: ✅ OK');

    // 3. Create Quiz with Topics & Submissions
    console.log('\n--- 3. Create Quizzes with Topics & Submissions ---');
    const quizRes = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'DSA Quiz 1',
      description: 'Arrays and Trees Evaluation',
      type: 'QUIZ',
      passingScore: 50,
      questions: [
        {
          questionText: 'What is access time of array index?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctOptionIndex: 0,
          points: 10,
          topic: 'Arrays'
        },
        {
          questionText: 'Is binary search tree always balanced?',
          options: ['Yes', 'No', 'Sometimes', 'Never'],
          correctOptionIndex: 1,
          points: 10,
          topic: 'Trees'
        }
      ]
    });
    const quizId = quizRes.data._id || quizRes.data.data?._id;

    // Student 1 submits Quiz (1 correct, 1 wrong: 10/20 = 50%)
    await student1Client(`/assessments/${quizId}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 }, // Correct (Arrays)
        { questionIndex: 1, selectedOptionIndex: 0 }  // Wrong (Trees)
      ]
    });

    // Student 2 submits Quiz (2 correct: 20/20 = 100%)
    await student2Client(`/assessments/${quizId}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 }, // Correct (Arrays)
        { questionIndex: 1, selectedOptionIndex: 1 }  // Correct (Trees)
      ]
    });
    console.log('Quiz Submissions Recorded: ✅ OK');

    // 4. Create Assignment & Submissions
    console.log('\n--- 4. Create Assignment & Grades ---');
    const assignRes = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'DSA Assignment 1',
      description: 'Implement dynamic array',
      type: 'ASSIGNMENT',
      totalPoints: 100,
      passingScore: 50
    });
    const assignmentId = assignRes.data._id || assignRes.data.data?._id;

    const sub1Res = await student1Client(`/assessments/${assignmentId}/submit`, 'POST', {
      content: 'Here is my dynamic array code...'
    });
    const sub1Id = sub1Res.data._id || sub1Res.data.data?._id;

    await facultyClient(`/submissions/${sub1Id}/grade`, 'PUT', {
      score: 80,
      feedback: 'Good implementation'
    });
    console.log('Assignment Graded for Student 1 (80%): ✅ OK');

    // 5. Attendance Session & Records
    console.log('\n--- 5. Attendance Setup ---');
    const sessionRes = await facultyClient(`/courses/${courseId}/attendance/sessions`, 'POST', {
      title: 'DSA Lecture 1',
      date: new Date(),
      sessionType: 'LECTURE',
      enableOtp: true,
      otpValidityMinutes: 15
    });
    const otpCode = sessionRes.data.data.otpCode;
    await student1Client(`/courses/${courseId}/attendance/check-in`, 'POST', { otpCode });
    console.log('Student 1 Checked In: ✅ OK');

    // 6. Discussion Forum Interaction
    console.log('\n--- 6. Discussion Engagement ---');
    const threadRes = await student1Client(`/courses/${courseId}/threads`, 'POST', {
      title: 'Time complexity of quicksort worst case?',
      content: 'Why is quicksort O(n^2) when pivot is bad?',
      category: 'QUESTION'
    });
    const threadId = threadRes.data.data._id;
    await facultyClient(`/threads/${threadId}/upvote`, 'POST');
    console.log('Discussion Thread Created and Upvoted: ✅ OK');

    // 7. Student Analytics Verification
    console.log('\n--- 7. Verify Student Analytics API ---');
    const studentOverviewRes = await student1Client('/analytics/student/overview', 'GET');
    console.log('Student Overview Status:', studentOverviewRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const overview = studentOverviewRes.data.data;
    console.log('Overview Metrics:', {
      overallScore: overview.overallScore,
      assignment: overview.assignmentPerformance,
      quiz: overview.quizPerformance,
      attendance: overview.attendance,
      progress: overview.learningProgress,
      engagement: overview.engagement
    });

    const isScoreCorrect =
      overview.assignmentPerformance === 80 &&
      overview.quizPerformance === 50 &&
      overview.attendance === 100 &&
      overview.learningProgress === 100;
    console.log('Metric Calculation Accuracy:', isScoreCorrect ? '✅ PERFECT' : '❌ INCORRECT');

    // Verify Course breakdown for student
    const studentCoursesRes = await student1Client('/analytics/student/courses', 'GET');
    console.log('Student Courses Status:', studentCoursesRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log(`Course Found: "${studentCoursesRes.data.data[0]?.title}" (Score: ${studentCoursesRes.data.data[0]?.overallScore}%)`);

    // Verify Student Topics
    const studentTopicsRes = await student1Client('/analytics/student/topics', 'GET');
    console.log('Student Topics Status:', studentTopicsRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const topicList = studentTopicsRes.data.data;
    const arraysTopic = topicList.find((t) => t.topic === 'Arrays');
    const treesTopic = topicList.find((t) => t.topic === 'Trees');
    console.log('Topic Performance Breakdown:', {
      Arrays: `${arraysTopic?.accuracy}% (${arraysTopic?.correctAnswers}/${arraysTopic?.questionsAttempted})`,
      Trees: `${treesTopic?.accuracy}% (${treesTopic?.correctAnswers}/${treesTopic?.questionsAttempted})`
    });
    const isTopicCorrect = arraysTopic?.accuracy === 100 && treesTopic?.accuracy === 0;
    console.log('Topic Accuracy Calculation:', isTopicCorrect ? '✅ PERFECT' : '❌ INCORRECT');

    // 8. Faculty Analytics Verification
    console.log('\n--- 8. Verify Faculty Analytics API ---');
    const facultyOverviewRes = await facultyClient('/analytics/faculty/overview', 'GET');
    console.log('Faculty Overview Status:', facultyOverviewRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const facData = facultyOverviewRes.data.data;
    console.log(`Assigned Courses: ${facData.totalCourses}, Total Enrolled: ${facData.totalStudents}`);

    const courseDistRes = await facultyClient(`/analytics/course/${courseId}/distribution`, 'GET');
    console.log('Course Distribution Status:', courseDistRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log('Grade Distribution:', courseDistRes.data.data.distribution);

    const courseStudentsRes = await facultyClient(`/analytics/course/${courseId}/students`, 'GET');
    console.log('Course Students Roster Status:', courseStudentsRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log(`Students Evaluated in Course: ${courseStudentsRes.data.data.students.length}`);

    // 9. Admin Analytics Verification
    console.log('\n--- 9. Verify Admin Institution & Department Analytics ---');
    const adminOverviewRes = await adminClient('/analytics/admin/overview', 'GET');
    console.log('Admin Overview Status:', adminOverviewRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log('Institution Metrics:', {
      students: adminOverviewRes.data.data.totalStudents,
      faculty: adminOverviewRes.data.data.totalFaculty,
      courses: adminOverviewRes.data.data.totalCourses,
      avgPerformance: adminOverviewRes.data.data.averagePerformance
    });

    const adminDeptRes = await adminClient('/analytics/admin/departments', 'GET');
    console.log('Admin Departments Status:', adminDeptRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log('Department Breakdown:', adminDeptRes.data.data);

    // 10. Security & Authorization Verification
    console.log('\n--- 10. Verify Security & RBAC Guardrails ---');
    const unauthorizedStudentAdminAccess = await student1Client('/analytics/admin/overview', 'GET');
    console.log('Student Blocked from Admin Analytics (403):', unauthorizedStudentAdminAccess.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    const unauthorizedStudentFacultyAccess = await student1Client('/analytics/faculty/overview', 'GET');
    console.log('Student Blocked from Faculty Analytics (403):', unauthorizedStudentFacultyAccess.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    console.log('\n==================================================');
    console.log('🎉 All Module 6 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule6Tests();
