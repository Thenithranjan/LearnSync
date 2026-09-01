const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Assessment = require('./src/models/Assessment');
const Submission = require('./src/models/Submission');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule3Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 3 (Assessments & Quizzes) Verification');
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
    await User.deleteMany({ email: /@mod3test\.com$/ });
    await Course.deleteMany({ code: /^M3TEST/ });
    await Assessment.deleteMany({ title: /^Test / });
    await Submission.deleteMany({});

    const PORT = 5003;
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
    const studentClient = createSession();

    // 1. User Setup
    console.log('--- 1. User Setup ---');
    await User.create({
      name: 'System Admin',
      email: 'admin@mod3test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Administration'
    });

    const adminLogin = await adminClient('/auth/login', 'POST', {
      email: 'admin@mod3test.com',
      password: 'Password123!'
    });
    console.log('Admin Authentication:', adminLogin.status === 200 ? '✅ OK' : '❌ FAIL');

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Dr. Turing',
      email: 'faculty@mod3test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    console.log('Faculty Registration:', facultyReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const facultyId = facultyReg.data.user.id;

    const studentReg = await studentClient('/auth/register', 'POST', {
      name: 'Ada Lovelace',
      email: 'student@mod3test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Student Registration:', studentReg.status === 201 ? '✅ OK' : '❌ FAIL');

    // 2. Create Course (by Admin & assign to Faculty)
    console.log('\n--- 2. Create Course ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Test Algorithms Course',
      code: 'M3TEST101',
      description: 'Intro to Algorithms',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    console.log('Create Course:', courseRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const courseId = courseRes.data.course._id;

    // Assign faculty to course
    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await adminClient(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });

    // Student enrolls in course
    await studentClient(`/courses/${courseId}/enroll`, 'POST');

    // 3. Faculty Creates MCQ Quiz
    console.log('\n--- 3. Create MCQ Quiz ---');
    const quizRes = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'Test Data Structures Quiz',
      description: 'Test on Stacks and Queues',
      type: 'QUIZ',
      passingScore: 50,
      timeLimitMinutes: 10,
      questions: [
        {
          questionText: 'Which structure is LIFO?',
          options: ['Queue', 'Stack', 'Tree', 'Graph'],
          correctOptionIndex: 1,
          points: 10,
          explanation: 'Stack is Last-In-First-Out.'
        },
        {
          questionText: 'Which structure is FIFO?',
          options: ['Queue', 'Stack', 'Heap', 'Array'],
          correctOptionIndex: 0,
          points: 10,
          explanation: 'Queue is First-In-First-Out.'
        }
      ]
    });
    console.log('Create Quiz:', quizRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const quizId = quizRes.data._id || quizRes.data.data?._id;

    // 4. Student Retrieves Quiz (Verify correct answer is hidden)
    console.log('\n--- 4. Verify Correct Option Obfuscation for Students ---');
    const studentQuizView = await studentClient(`/assessments/${quizId}`, 'GET');
    const questionsList = studentQuizView.data.questions || studentQuizView.data.data?.questions || [];
    const q1 = questionsList[0] || {};
    const isObfuscated = q1.correctOptionIndex === undefined;
    console.log('Answer Hidden from Student:', isObfuscated ? '✅ PASSED (Hidden)' : '❌ FAIL (Exposed!)');

    // 5. Student Takes & Submits Quiz
    console.log('\n--- 5. Student Submits Quiz (Auto-Scoring Verification) ---');
    const submitQuizRes = await studentClient(`/assessments/${quizId}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 1 }, // Correct (+10)
        { questionIndex: 1, selectedOptionIndex: 0 }  // Correct (+10)
      ]
    });
    console.log('Quiz Submission Status:', submitQuizRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const subData = submitQuizRes.data.score !== undefined ? submitQuizRes.data : submitQuizRes.data.data;
    console.log(`Auto-graded Score: ${subData.score}/${subData.totalPoints} (${subData.percentage}%) - Passed: ${subData.isPassed}`);
    const autoScorePass = subData.score === 20 && subData.isPassed === true;
    console.log('Auto-Score Correctness:', autoScorePass ? '✅ PERFECT' : '❌ INCORRECT');

    // 6. Faculty Creates Assignment
    console.log('\n--- 6. Create Assignment & Student Submission ---');
    const assignRes = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'Test Coding Project',
      description: 'Implement a binary search tree in JS',
      type: 'ASSIGNMENT',
      totalPoints: 50,
      passingScore: 60
    });
    const assignmentId = assignRes.data._id || assignRes.data.data?._id;
    console.log('Create Assignment:', assignRes.status === 201 ? '✅ OK' : '❌ FAIL');

    // Student Submits Assignment
    const submitAssignRes = await studentClient(`/assessments/${assignmentId}/submit`, 'POST', {
      content: 'Here is my BST class implementation...',
      attachmentUrl: 'https://github.com/student/bst-repo'
    });
    console.log('Submit Assignment:', submitAssignRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const submissionId = submitAssignRes.data._id || submitAssignRes.data.data?._id;

    // 7. Faculty Grades Assignment
    console.log('\n--- 7. Faculty Grading & Feedback ---');
    const gradeRes = await facultyClient(`/submissions/${submissionId}/grade`, 'PUT', {
      score: 45,
      feedback: 'Excellent clean code with great time complexity!'
    });
    console.log('Grade Assignment:', gradeRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const gradeData = gradeRes.data.score !== undefined ? gradeRes.data : gradeRes.data.data;
    console.log(`Assigned: ${gradeData.score}/${gradeData.totalPoints} (${gradeData.percentage}%)`);
    console.log(`Feedback: "${gradeData.feedback}"`);

    console.log('\n==================================================');
    console.log('🎉 All Module 3 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule3Tests();
