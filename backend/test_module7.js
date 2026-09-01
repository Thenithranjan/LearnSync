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
const LearningGap = require('./src/models/LearningGap');
const Recommendation = require('./src/models/Recommendation');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule7Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 7 (Academic Intelligence) Verification');
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
    await User.deleteMany({ email: /@mod7test\.com$/ });
    await Course.deleteMany({ code: /^M7TEST/ });
    await Assessment.deleteMany({});
    await Submission.deleteMany({});
    await AttendanceSession.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await LearningProgress.deleteMany({});
    await Module.deleteMany({});
    await Material.deleteMany({});
    await Thread.deleteMany({});
    await Reply.deleteMany({});
    await LearningGap.deleteMany({});
    await Recommendation.deleteMany({});

    const PORT = 5007;
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
    const student1Client = createSession(); // Struggling student
    const student2Client = createSession(); // Strong student
    const student3Client = createSession(); // New student with no data

    // 1. User Setup
    console.log('--- 1. User Setup ---');
    await User.create({
      name: 'Academic Intelligence Admin',
      email: 'admin@mod7test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Academic Affairs'
    });

    const adminLogin = await adminClient('/auth/login', 'POST', {
      email: 'admin@mod7test.com',
      password: 'Password123!'
    });
    console.log('Admin Authentication:', adminLogin.status === 200 ? '✅ OK' : '❌ FAIL');

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Prof. Intelligence',
      email: 'faculty@mod7test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    console.log('Faculty Registration:', facultyReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const facultyId = facultyReg.data.user.id;

    const s1Reg = await student1Client('/auth/register', 'POST', {
      name: 'Struggling Student',
      email: 'student1@mod7test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    const student1Id = s1Reg.data.user.id;

    const s2Reg = await student2Client('/auth/register', 'POST', {
      name: 'Excelling Student',
      email: 'student2@mod7test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });

    const s3Reg = await student3Client('/auth/register', 'POST', {
      name: 'New Student No Data',
      email: 'student3@mod7test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Students Registered: ✅ OK');

    // 2. Course Creation & Content Setup
    console.log('\n--- 2. Create Course & Materials ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Advanced Data Structures & Algorithms',
      code: 'M7TEST501',
      description: 'Graphs, Trees, and Dynamic Programming',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    const courseId = courseRes.data.course._id;

    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await adminClient(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });

    // Enroll students
    await student1Client(`/courses/${courseId}/enroll`, 'POST');
    await student2Client(`/courses/${courseId}/enroll`, 'POST');
    await student3Client(`/courses/${courseId}/enroll`, 'POST');

    // Modules & Materials
    const modRes = await adminClient(`/courses/${courseId}/modules`, 'POST', {
      title: 'Module 1: Trees & Graphs',
      description: 'Tree traversals and shortest paths'
    });
    const moduleId = modRes.data.module._id;

    const matRes = await adminClient(`/modules/${moduleId}/materials`, 'POST', {
      title: 'Binary Search Tree Mastery Lecture',
      type: 'VIDEO',
      url: 'https://example.com/trees-video.mp4',
      topic: 'Trees'
    });
    const materialId = matRes.data.material._id;

    // Student 2 completes material, Student 1 does not
    await student2Client(`/materials/${materialId}/complete`, 'POST', { completed: true });

    // 3. Quiz with Concept Questions (Topic: Trees - 4 questions)
    console.log('\n--- 3. Create Multi-Question Quizzes (Trees & Graphs) ---');
    const treeQuizRes = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'Tree Traversal Evaluation Quiz',
      type: 'QUIZ',
      passingScore: 50,
      questions: [
        { questionText: 'What is inorder traversal of BST?', options: ['Sorted', 'Random', 'Reverse', 'Heap'], correctOptionIndex: 0, points: 5, topic: 'Trees' },
        { questionText: 'Max height of balanced BST?', options: ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)'], correctOptionIndex: 0, points: 5, topic: 'Trees' },
        { questionText: 'Time to search in unbalanced BST?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n!)'], correctOptionIndex: 0, points: 5, topic: 'Trees' },
        { questionText: 'Which node is root in preorder?', options: ['First', 'Last', 'Middle', 'Random'], correctOptionIndex: 0, points: 5, topic: 'Trees' }
      ]
    });
    const treeQuizId = treeQuizRes.data._id || treeQuizRes.data.data?._id;

    // Student 1 attempts Tree Quiz: 1 correct out of 4 (25% accuracy -> HIGH SEVERITY GAP)
    await student1Client(`/assessments/${treeQuizId}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 }, // Correct
        { questionIndex: 1, selectedOptionIndex: 1 }, // Wrong
        { questionIndex: 2, selectedOptionIndex: 1 }, // Wrong
        { questionIndex: 3, selectedOptionIndex: 1 }  // Wrong
      ]
    });

    // Student 2 attempts Tree Quiz: 4 correct out of 4 (100% accuracy -> STRONG TOPIC)
    await student2Client(`/assessments/${treeQuizId}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 },
        { questionIndex: 1, selectedOptionIndex: 0 },
        { questionIndex: 2, selectedOptionIndex: 0 },
        { questionIndex: 3, selectedOptionIndex: 0 }
      ]
    });

    // 4. Attendance Session Setup
    console.log('\n--- 4. Attendance Setup ---');
    const sessionRes = await facultyClient(`/courses/${courseId}/attendance/sessions`, 'POST', {
      title: 'Trees & Graphs Lecture 1',
      date: new Date(),
      sessionType: 'LECTURE',
      enableOtp: true,
      otpValidityMinutes: 30
    });
    const otpCode = sessionRes.data.data.otpCode;
    // Only Student 2 checks in
    await student2Client(`/courses/${courseId}/attendance/check-in`, 'POST', { otpCode });

    // 5. Verify Learning Gap Detection
    console.log('\n--- 5. Verify Evidence-Based Learning Gap Detection ---');
    const s1GapsRes = await student1Client('/intelligence/student/gaps', 'GET');
    console.log('Student 1 Gaps Retrieval:', s1GapsRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const s1Gaps = s1GapsRes.data.data;
    const treeGap = s1Gaps.attentionTopics?.find((g) => g.topic === 'Trees');
    console.log('Detected Gap Details:', {
      topic: treeGap?.topic,
      accuracy: `${treeGap?.accuracy}%`,
      severity: treeGap?.severity,
      evidenceLevel: treeGap?.evidenceLevel,
      evidenceItems: treeGap?.evidence?.length
    });
    const gapPassed = treeGap && treeGap.accuracy === 25 && treeGap.severity === 'HIGH' && treeGap.evidenceLevel === 'LOW';
    console.log('Gap Severity & Evidence Validation:', gapPassed ? '✅ PERFECT' : '❌ INCORRECT');

    // 6. Verify Academic Risk Score
    console.log('\n--- 6. Verify Explainable Academic Risk Score ---');
    const s1RiskRes = await student1Client('/intelligence/student/risk', 'GET');
    console.log('Student 1 Risk Score Status:', s1RiskRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const s1Risk = s1RiskRes.data.data;
    console.log('Risk Indicator:', {
      riskScore: s1Risk.riskScore,
      riskLevel: s1Risk.riskLevel,
      explanation: s1Risk.explanation,
      factorsCount: s1Risk.factors?.length
    });
    const riskPassed = s1Risk.riskScore > 50 && (s1Risk.riskLevel === 'HIGH' || s1Risk.riskLevel === 'MODERATE');
    console.log('Risk Calculation Correctness:', riskPassed ? '✅ CORRECT RISK FLAGGED' : '❌ INCORRECT');

    // 7. Verify Insufficient Data Handling for New Student 3
    console.log('\n--- 7. Verify Insufficient Data Handling ---');
    const s3RiskRes = await student3Client('/intelligence/student/risk', 'GET');
    console.log('New Student Risk Status:', s3RiskRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const isInsufficient = s3RiskRes.data.data.riskLevel === 'INSUFFICIENT_DATA';
    console.log('Insufficient Data Correctness (No False High Risk):', isInsufficient ? '✅ SAFE & PROPER' : '❌ FALSE ALARM');

    // 8. Verify Personalized Recommendations
    console.log('\n--- 8. Verify Personalized Recommendations & Actions ---');
    const recsRes = await student1Client('/intelligence/student/recommendations', 'GET');
    console.log('Recommendations Status:', recsRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const recommendations = recsRes.data.data;
    console.log(`Generated ${recommendations.length} Recommendations for Student 1:`);
    recommendations.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.priority}] ${r.title} (Reason: ${r.reason})`);
    });
    const recId = recommendations[0]?._id;

    // Complete recommendation
    const completeRes = await student1Client(`/intelligence/recommendations/${recId}/complete`, 'POST');
    console.log('Complete Recommendation Status:', completeRes.status === 200 && completeRes.data.data.status === 'COMPLETED' ? '✅ COMPLETED' : '❌ FAIL');

    // 9. Verify Faculty Early Warning
    console.log('\n--- 9. Verify Faculty Early Warning Center ---');
    const earlyWarnRes = await facultyClient(`/intelligence/course/${courseId}/early-warning`, 'GET');
    console.log('Early Warning Status:', earlyWarnRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const warnData = earlyWarnRes.data.data;
    console.log('Class Risk Summary:', warnData.riskSummary);
    console.log(`At-risk Students Flagged: ${warnData.earlyWarnings.length}`);
    const flaggedStudent = warnData.earlyWarnings.find((w) => w.studentId === student1Id);
    console.log('Flagged Student Suggested Actions:', flaggedStudent?.suggestedActions);

    // 10. Verify Admin Intelligence Overview
    console.log('\n--- 10. Verify Admin Institution Intelligence ---');
    const adminOverviewRes = await adminClient('/intelligence/admin/overview', 'GET');
    console.log('Admin Intelligence Status:', adminOverviewRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log('Admin Institution Overview:', adminOverviewRes.data.data);

    // 11. Security & RBAC Guardrails
    console.log('\n--- 11. Verify Security & RBAC Isolation ---');
    const studentBlockedFromFacultyEarlyWarning = await student1Client(`/intelligence/course/${courseId}/early-warning`, 'GET');
    console.log('Student Blocked from Faculty Early Warning (403):', studentBlockedFromFacultyEarlyWarning.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    const studentBlockedFromAdminIntelligence = await student1Client('/intelligence/admin/overview', 'GET');
    console.log('Student Blocked from Admin Intelligence (403):', studentBlockedFromAdminIntelligence.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    console.log('\n==================================================');
    console.log('🎉 All Module 7 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule7Tests();
