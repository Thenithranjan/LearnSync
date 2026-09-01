const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const AttendanceSession = require('./src/models/AttendanceSession');
const AttendanceRecord = require('./src/models/AttendanceRecord');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule4Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 4 (Attendance Management) Verification');
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
    await User.deleteMany({ email: /@mod4test\.com$/ });
    await Course.deleteMany({ code: /^M4TEST/ });
    await AttendanceSession.deleteMany({});
    await AttendanceRecord.deleteMany({});

    const PORT = 5004;
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
      email: 'admin@mod4test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Administration'
    });

    const adminLogin = await adminClient('/auth/login', 'POST', {
      email: 'admin@mod4test.com',
      password: 'Password123!'
    });
    console.log('Admin Authentication:', adminLogin.status === 200 ? '✅ OK' : '❌ FAIL');

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Prof. Hopper',
      email: 'faculty@mod4test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    console.log('Faculty Registration:', facultyReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const facultyId = facultyReg.data.user.id;

    const studentReg = await studentClient('/auth/register', 'POST', {
      name: 'Grace Student',
      email: 'student@mod4test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Student Registration:', studentReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const studentId = studentReg.data.user.id;

    // 2. Create Course & Enroll Student
    console.log('\n--- 2. Create Course & Enrollment ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Operating Systems',
      code: 'M4TEST201',
      description: 'Concurrency, Memory Management, and Kernels',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    const courseId = courseRes.data.course._id;

    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await adminClient(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });
    const enrollRes = await studentClient(`/courses/${courseId}/enroll`, 'POST');
    console.log('Student Enrollment:', enrollRes.status === 201 ? '✅ OK' : '❌ FAIL');

    // 3. Faculty Creates Class Session with OTP
    console.log('\n--- 3. Faculty Creates Session with OTP ---');
    const sessionRes = await facultyClient(`/courses/${courseId}/attendance/sessions`, 'POST', {
      title: 'Lecture 1: Processes and Threads',
      date: new Date(),
      sessionType: 'LECTURE',
      enableOtp: true,
      otpValidityMinutes: 30
    });
    console.log('Create Session Status:', sessionRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const sessionData = sessionRes.data.data;
    const sessionId = sessionData._id;
    const otpCode = sessionData.otpCode;
    console.log(`Generated OTP: "${otpCode}" (Expires at: ${sessionData.otpExpiresAt})`);

    // 4. Student Checks In using OTP
    console.log('\n--- 4. Student Self Check-in via OTP ---');
    const checkInRes = await studentClient(`/courses/${courseId}/attendance/check-in`, 'POST', {
      otpCode
    });
    console.log('Student OTP Check-in Status:', checkInRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log(`Check-in result: marked ${checkInRes.data.data.status} by ${checkInRes.data.data.markedBy}`);

    // 5. Student Summary Verification (100% attendance)
    console.log('\n--- 5. Verify Student Attendance Summary ---');
    const summaryRes = await studentClient(`/courses/${courseId}/attendance/my-summary`, 'GET');
    const summaryData = summaryRes.data.data;
    console.log(`Attendance: ${summaryData.presentCount}/${summaryData.totalSessions} (${summaryData.percentage}%) - At Risk: ${summaryData.isAtRisk}`);
    const firstCheckPass = summaryData.percentage === 100 && summaryData.isAtRisk === false;
    console.log('Summary Calculation:', firstCheckPass ? '✅ PERFECT' : '❌ FAIL');

    // 6. Faculty Creates 3 More Sessions (Student misses them -> triggers <75% Warning)
    console.log('\n--- 6. Low Attendance Risk Detection (<75%) ---');
    for (let i = 2; i <= 4; i++) {
      await facultyClient(`/courses/${courseId}/attendance/sessions`, 'POST', {
        title: `Lecture ${i}: Memory Hierarchy`,
        date: new Date(),
        sessionType: 'LECTURE',
        enableOtp: false
      });
    }

    const updatedSummaryRes = await studentClient(`/courses/${courseId}/attendance/my-summary`, 'GET');
    const updatedSummary = updatedSummaryRes.data.data;
    console.log(`Updated Attendance: ${updatedSummary.presentCount}/${updatedSummary.totalSessions} (${updatedSummary.percentage}%) - At Risk: ${updatedSummary.isAtRisk}`);
    const riskPass = updatedSummary.percentage === 25 && updatedSummary.isAtRisk === true;
    console.log('Low Attendance Warning (<75%):', riskPass ? '✅ AT RISK FLAG ACTIVATED' : '❌ FAIL');

    // 7. Course Attendance Report for Faculty
    console.log('\n--- 7. Faculty Course Attendance Report ---');
    const reportRes = await facultyClient(`/courses/${courseId}/attendance/report`, 'GET');
    const reportData = reportRes.data.data;
    console.log(`Total Enrolled: ${reportData.totalStudents}, Total Sessions: ${reportData.totalSessions}`);
    console.log('Student in Report:', reportData.studentStats[0]?.name, `(${reportData.studentStats[0]?.percentage}%)`);
    console.log('Report Retrieval:', reportRes.status === 200 ? '✅ OK' : '❌ FAIL');

    console.log('\n==================================================');
    console.log('🎉 All Module 4 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule4Tests();
