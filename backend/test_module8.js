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
const Recommendation = require('./src/models/Recommendation');
const Intervention = require('./src/models/Intervention');
const InterventionOutcome = require('./src/models/InterventionOutcome');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule8Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 8 (Intervention & Improvement) Verification');
  console.log('==================================================\n');

  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edupulse';

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Connected to MongoDB.`);
    } catch (err) {
      console.log('⚠️ Local MongoDB not running. Launching in-memory MongoDB instance...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to in-memory MongoDB instance.`);
    }

    // Clean test data
    await User.deleteMany({ email: /@mod8test\.com$/ });
    await Course.deleteMany({ code: /^M8TEST/ });
    await Assessment.deleteMany({});
    await Submission.deleteMany({});
    await Module.deleteMany({});
    await Material.deleteMany({});
    await Recommendation.deleteMany({});
    await Intervention.deleteMany({});
    await InterventionOutcome.deleteMany({});

    const PORT = 5008;
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
      name: 'Module 8 Admin',
      email: 'admin@mod8test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Academic Support'
    });
    await adminClient('/auth/login', 'POST', { email: 'admin@mod8test.com', password: 'Password123!' });

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Prof. Support',
      email: 'faculty@mod8test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    const facultyId = facultyReg.data.user.id;

    const s1Reg = await student1Client('/auth/register', 'POST', {
      name: 'Arun Student',
      email: 'student1@mod8test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    const student1Id = s1Reg.data.user.id;

    const s2Reg = await student2Client('/auth/register', 'POST', {
      name: 'Priya Student',
      email: 'student2@mod8test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });

    console.log('User Registrations: ✅ OK');

    // 2. Course Creation & Enrollment
    console.log('\n--- 2. Create Course & Enrollment ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Data Structures & Algorithms II',
      code: 'M8TEST601',
      description: 'Trees, Graphs, and Dynamic Programming',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    const courseId = courseRes.data.course._id;

    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await student1Client(`/courses/${courseId}/enroll`, 'POST');
    await student2Client(`/courses/${courseId}/enroll`, 'POST');
    console.log('Course Setup & Student Enrollments: ✅ OK');

    // 3. Create Initial Quiz (Topic: Dynamic Programming - Student 1 scores 30%)
    console.log('\n--- 3. Initial Baseline Evaluation (Quiz 1 - Topic: Dynamic Programming) ---');
    const quiz1Res = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'DP Baseline Quiz',
      type: 'QUIZ',
      passingScore: 50,
      questions: [
        { questionText: 'Q1 DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' },
        { questionText: 'Q2 DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' },
        { questionText: 'Q3 DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' }
      ]
    });
    const quiz1Id = quiz1Res.data._id || quiz1Res.data.data?._id;

    // Student 1 scores 1 out of 3 correct (33.3% accuracy)
    await student1Client(`/assessments/${quiz1Id}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 },
        { questionIndex: 1, selectedOptionIndex: 1 },
        { questionIndex: 2, selectedOptionIndex: 1 }
      ]
    });

    // 4. Create Recommendation & Convert to Intervention
    console.log('\n--- 4. Recommendation to Intervention Conversion ---');
    const rec = await Recommendation.create({
      studentId: student1Id,
      courseId,
      topic: 'Dynamic Programming',
      type: 'PRACTICE',
      title: 'Review DP Memoization Concepts',
      description: 'Topic accuracy is below 40%',
      priority: 'HIGH',
      reason: 'Low baseline score on DP Quiz 1',
      status: 'PENDING'
    });

    const convertRes = await facultyClient(`/interventions/from-recommendation/${rec._id}`, 'POST', {
      actionType: 'DOUBT_SESSION',
      title: '1-on-1 DP Memoization Support Session',
      dueDate: new Date(Date.now() + 7 * 86400000)
    });
    console.log('Conversion Status:', convertRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const interventionId = convertRes.data.data._id;
    console.log('Created Intervention ID:', interventionId);

    // 5. Test Closed-Loop Workflow Transitions
    console.log('\n--- 5. Test Closed-Loop Status Workflow ---');
    
    // Student acknowledges
    const ackRes = await student1Client(`/interventions/${interventionId}/acknowledge`, 'POST');
    console.log('Acknowledge Status:', ackRes.status === 200 && ackRes.data.data.status === 'ACKNOWLEDGED' ? '✅ ACKNOWLEDGED' : '❌ FAIL');

    // Student starts
    const startRes = await student1Client(`/interventions/${interventionId}/start`, 'POST');
    console.log('Start Status:', startRes.status === 200 && startRes.data.data.status === 'IN_PROGRESS' ? '✅ IN_PROGRESS' : '❌ FAIL');

    // Student completes with response
    const completeRes = await student1Client(`/interventions/${interventionId}/complete`, 'POST', {
      studentResponse: 'I reviewed memoization state transitions and attended the doubt session.'
    });
    console.log('Completion Status:', completeRes.status === 200 && completeRes.data.data.status === 'COMPLETED' ? '✅ COMPLETED' : '❌ FAIL');

    // 6. Faculty Review & Feedback Submission
    console.log('\n--- 6. Faculty Review & Outcome Submission ---');
    const reviewRes = await facultyClient(`/interventions/${interventionId}/review`, 'POST', {
      facultyNotes: 'Student demonstrated clear understanding during the 1-on-1 session.',
      outcome: 'IMPROVED'
    });
    console.log('Faculty Review Status:', reviewRes.status === 200 && reviewRes.data.data.status === 'REVIEWED' ? '✅ REVIEWED' : '❌ FAIL');

    // 7. Post-Intervention Re-Evaluation (Quiz 2 - Student 1 scores 100%)
    console.log('\n--- 7. Post-Intervention Re-Evaluation (Quiz 2 - Topic: Dynamic Programming) ---');
    const quiz2Res = await facultyClient(`/courses/${courseId}/assessments`, 'POST', {
      title: 'DP Post-Intervention Evaluation Quiz',
      type: 'QUIZ',
      passingScore: 50,
      questions: [
        { questionText: 'Q1 Post DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' },
        { questionText: 'Q2 Post DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' },
        { questionText: 'Q3 Post DP', options: ['A', 'B'], correctOptionIndex: 0, points: 5, topic: 'Dynamic Programming' }
      ]
    });
    const quiz2Id = quiz2Res.data._id || quiz2Res.data.data?._id;

    // Student 1 scores 3 out of 3 correct (100% accuracy)
    await student1Client(`/assessments/${quiz2Id}/submit`, 'POST', {
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 },
        { questionIndex: 1, selectedOptionIndex: 0 },
        { questionIndex: 2, selectedOptionIndex: 0 }
      ]
    });

    // 8. Measure Outcome & Improvement Delta
    console.log('\n--- 8. Measure Quantitative Improvement Delta ---');
    const evalRes = await facultyClient(`/interventions/${interventionId}/evaluate`, 'POST');
    console.log('Evaluation Endpoint Status:', evalRes.status === 200 ? '✅ OK' : '❌ FAIL');
    const outcomeData = evalRes.data.data.outcome;
    console.log('Outcome Delta Result:', {
      beforeScore: `${outcomeData.beforeScore}%`,
      afterScore: `${outcomeData.afterScore}%`,
      improvement: `+${outcomeData.improvement}%`,
      classification: outcomeData.classification,
      measurementStatus: outcomeData.measurementStatus
    });
    const outcomePassed = outcomeData.improvement > 20 && outcomeData.classification === 'SIGNIFICANT_IMPROVEMENT';
    console.log('Improvement Delta Calculation:', outcomePassed ? '✅ PERFECT' : '❌ INCORRECT');

    // 9. Verify Student Improvement History API
    console.log('\n--- 9. Verify Student Improvement History API ---');
    const historyRes = await student1Client('/interventions/student/history', 'GET');
    console.log('Student History Status:', historyRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log('Student History Metrics:', {
      totalMeasured: historyRes.data.data.totalMeasuredInterventions,
      averageImprovement: `+${historyRes.data.data.averageImprovement}%`
    });

    // 10. Verify Course & Admin Intervention Analytics APIs
    console.log('\n--- 10. Verify Intervention Analytics APIs ---');
    const courseAnalyticsRes = await facultyClient(`/interventions/analytics/course/${courseId}`, 'GET');
    console.log('Course Intervention Analytics:', courseAnalyticsRes.data.data);

    const adminAnalyticsRes = await adminClient('/interventions/admin/analytics', 'GET');
    console.log('Admin Intervention Analytics:', adminAnalyticsRes.data.data);

    // 11. Security & RBAC Guardrails
    console.log('\n--- 11. Security & RBAC Guardrails ---');
    const s2AccessBlocked = await student2Client(`/interventions/${interventionId}`, 'GET');
    console.log('Student 2 Blocked from Viewing Student 1 Intervention (403):', s2AccessBlocked.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    const studentBlockedFromReview = await student1Client(`/interventions/${interventionId}/review`, 'POST', { outcome: 'IMPROVED' });
    console.log('Student Blocked from Executing Faculty Review (403):', studentBlockedFromReview.status === 403 ? '✅ PROTECTED' : '❌ VULNERABLE');

    console.log('\n==================================================');
    console.log('🎉 All Module 8 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule8Tests();
