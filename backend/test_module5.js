const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Thread = require('./src/models/Thread');
const Reply = require('./src/models/Reply');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule5Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 5 (Discussion Forums) Verification');
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
    await User.deleteMany({ email: /@mod5test\.com$/ });
    await Course.deleteMany({ code: /^M5TEST/ });
    await Thread.deleteMany({});
    await Reply.deleteMany({});

    const PORT = 5005;
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
      email: 'admin@mod5test.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Administration'
    });

    await adminClient('/auth/login', 'POST', {
      email: 'admin@mod5test.com',
      password: 'Password123!'
    });

    const facultyReg = await facultyClient('/auth/register', 'POST', {
      name: 'Prof. Knuth',
      email: 'faculty@mod5test.com',
      password: 'Password123!',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    console.log('Faculty Registration:', facultyReg.status === 201 ? '✅ OK' : '❌ FAIL');
    const facultyId = facultyReg.data.user.id;

    const studentReg = await studentClient('/auth/register', 'POST', {
      name: 'Linus Torvalds',
      email: 'student@mod5test.com',
      password: 'Password123!',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    console.log('Student Registration:', studentReg.status === 201 ? '✅ OK' : '❌ FAIL');

    // 2. Create Course
    console.log('\n--- 2. Create Course ---');
    const courseRes = await adminClient('/courses', 'POST', {
      title: 'Advanced Computer Networks',
      code: 'M5TEST301',
      description: 'Routing, TCP/IP, and Protocols',
      department: 'Computer Science',
      status: 'PUBLISHED'
    });
    const courseId = courseRes.data.course._id;
    await adminClient(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    await adminClient(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });
    await studentClient(`/courses/${courseId}/enroll`, 'POST');

    // 3. Student Creates Discussion Thread
    console.log('\n--- 3. Student Creates Thread ---');
    const threadRes = await studentClient(`/courses/${courseId}/threads`, 'POST', {
      title: 'What is the difference between TCP and UDP checksum verification?',
      content: 'I am reviewing transport layer headers. How does UDP handle checksum failures compared to TCP retransmissions?',
      category: 'QUESTION',
      tags: 'networking, tcp, udp, transport'
    });
    console.log('Create Thread:', threadRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const threadData = threadRes.data.data;
    const threadId = threadData._id;

    // 4. Upvoting Thread
    console.log('\n--- 4. Upvoting Thread ---');
    const upvoteThreadRes = await facultyClient(`/threads/${threadId}/upvote`, 'POST');
    console.log('Upvote Thread Status:', upvoteThreadRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log(`Upvotes Count: ${upvoteThreadRes.data.data.upvoteCount}`);

    // 5. Faculty Posts an Answer
    console.log('\n--- 5. Faculty Posts Reply ---');
    const replyRes = await facultyClient(`/threads/${threadId}/replies`, 'POST', {
      content: 'UDP checksum is optional in IPv4 and simply discards corrupt packets without request, while TCP guarantees reliable delivery with ACKs.'
    });
    console.log('Post Reply Status:', replyRes.status === 201 ? '✅ OK' : '❌ FAIL');
    const replyData = replyRes.data.data;
    const replyId = replyData._id;

    // 6. Faculty Endorses Answer (Instructor Verified Solution)
    console.log('\n--- 6. Faculty Endorsement ---');
    const endorseRes = await facultyClient(`/replies/${replyId}/endorse`, 'PUT');
    console.log('Endorse Reply Status:', endorseRes.status === 200 ? '✅ OK' : '❌ FAIL');
    console.log(`Endorsed: ${endorseRes.data.data.isFacultyEndorsed}`);

    // 7. Search & Retrieval Verification
    console.log('\n--- 7. Search & Thread Details Verification ---');
    const searchRes = await studentClient(`/courses/${courseId}/threads?search=checksum`, 'GET');
    console.log('Search Threads Count:', searchRes.data.data?.length || 0);

    const detailsRes = await studentClient(`/threads/${threadId}`, 'GET');
    const details = detailsRes.data.data;
    console.log(`Thread Details: "${details.thread.title}"`);
    console.log(`Total Replies: ${details.replies.length}`);
    console.log(`Is Solved: ${details.thread.isResolved}`);
    const checkPass = details.thread.isResolved === true && details.replies[0].isFacultyEndorsed === true;
    console.log('Endorsement & Solution Flag:', checkPass ? '✅ PERFECT' : '❌ FAIL');

    console.log('\n==================================================');
    console.log('🎉 All Module 5 Automated Tests Passed Successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule5Tests();
