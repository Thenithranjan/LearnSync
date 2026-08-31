const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Module = require('./src/models/Module');
const Material = require('./src/models/Material');
const Enrollment = require('./src/models/Enrollment');
const LearningProgress = require('./src/models/LearningProgress');
const app = require('./src/app');

let server;
let mongoServer;

async function runModule2Tests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 2 Verification Tests');
  console.log('==================================================\n');

  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edupulse';

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Connected to local MongoDB.`);
    } catch (err) {
      console.log('⚠️  Local MongoDB not running. Launching in-memory MongoDB instance...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to in-memory MongoDB instance.`);
    }

    // Clean test records
    await User.deleteMany({ email: /@mod2test\.com$/ });
    await Course.deleteMany({ code: /^TEST/ });

    const PORT = 5002;
    server = app.listen(PORT);
    console.log(`✅ Test server running on port ${PORT}.\n`);

    const baseUrl = `http://localhost:${PORT}/api`;

    // Helper for requests with per-role cookie management
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

    const adminSession = createSession();
    const facultySession = createSession();
    const studentSession = createSession();

    // 1. Setup Accounts
    console.log('Setup: Registering Admin, Faculty, and Student users...');
    // Create admin directly in database since public admin registration is blocked
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@mod2test.com',
      password: 'Password123',
      role: 'ADMIN',
      department: 'Central Administration'
    });

    const facultyReg = await facultySession('/auth/register', 'POST', {
      name: 'Dr. Alan Turing',
      email: 'turing@mod2test.com',
      password: 'Password123',
      role: 'FACULTY',
      department: 'Computer Science'
    });
    const facultyId = facultyReg.data.user.id;

    const studentReg = await studentSession('/auth/register', 'POST', {
      name: 'Ada Lovelace',
      email: 'ada@mod2test.com',
      password: 'Password123',
      role: 'STUDENT',
      department: 'Computer Science'
    });

    // Login Admin
    await adminSession('/auth/login', 'POST', {
      email: 'admin@mod2test.com',
      password: 'Password123'
    });

    console.log('  ✅ PASSED: Users registered and authenticated.\n');

    // 2. Admin Creates Course
    console.log('Test 1: Admin Creates Draft Course (POST /api/courses)');
    const createCourseRes = await adminSession('/courses', 'POST', {
      title: 'Data Structures & Algorithms',
      description: 'Master arrays, linked lists, trees, and algorithm design.',
      code: 'TEST101',
      department: 'Computer Science',
      status: 'DRAFT'
    });
    if (createCourseRes.status !== 201) throw new Error(`Create course failed: ${JSON.stringify(createCourseRes.data)}`);
    const courseId = createCourseRes.data.course._id;
    console.log('  ✅ PASSED: Course created in DRAFT status with HTTP 201.');

    // 3. Admin Assigns Faculty & Publishes Course
    console.log('\nTest 2: Admin Assigns Faculty & Publishes Course');
    const assignRes = await adminSession(`/courses/${courseId}/faculty`, 'PUT', { facultyId });
    if (assignRes.status !== 200 || assignRes.data.course.faculty._id !== facultyId) {
      throw new Error(`Assign faculty failed: ${JSON.stringify(assignRes.data)}`);
    }

    const publishRes = await adminSession(`/courses/${courseId}`, 'PUT', { status: 'PUBLISHED' });
    if (publishRes.status !== 200 || publishRes.data.course.status !== 'PUBLISHED') {
      throw new Error(`Publish course failed: ${JSON.stringify(publishRes.data)}`);
    }
    console.log('  ✅ PASSED: Faculty assigned and course published with HTTP 200.');

    // 4. Faculty Adds Module
    console.log('\nTest 3: Faculty Creates Syllabus Module (POST /api/courses/:id/modules)');
    const moduleRes = await facultySession(`/courses/${courseId}/modules`, 'POST', {
      title: 'Module 1: Linear Data Structures',
      description: 'Arrays, Stacks, and Queues fundamentals.',
      order: 1,
      isPublished: true
    });
    if (moduleRes.status !== 201) throw new Error(`Module creation failed: ${JSON.stringify(moduleRes.data)}`);
    const moduleId = moduleRes.data.module._id;
    console.log('  ✅ PASSED: Module created by assigned faculty with HTTP 201.');

    // 5. Faculty Adds 2 Learning Materials
    console.log('\nTest 4: Faculty Adds Learning Materials (POST /api/modules/:id/materials)');
    const mat1Res = await facultySession(`/modules/${moduleId}/materials`, 'POST', {
      title: 'Arrays Overview PDF',
      type: 'PDF',
      url: 'https://example.com/arrays.pdf',
      duration: 15
    });
    const mat1Id = mat1Res.data.material._id;

    const mat2Res = await facultySession(`/modules/${moduleId}/materials`, 'POST', {
      title: 'Linked List Video Lecture',
      type: 'VIDEO',
      url: 'https://example.com/linkedlists.mp4',
      duration: 30
    });
    const mat2Id = mat2Res.data.material._id;

    if (mat1Res.status === 201 && mat2Res.status === 201) {
      console.log('  ✅ PASSED: 2 Learning materials (PDF & Video) added with HTTP 201.');
    } else {
      throw new Error('Failed to add learning materials.');
    }

    // 6. Security Check: Student forbidden from creating course/module
    console.log('\nTest 5: Security Check - Student denied Course creation');
    const studentCreateCourse = await studentSession('/courses', 'POST', {
      title: 'Hacker Course',
      description: 'Unauthorized',
      code: 'TEST999',
      department: 'Hacking'
    });
    if (studentCreateCourse.status === 403) {
      console.log('  ✅ PASSED: Student course creation blocked with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Student course creation security breach! Status: ${studentCreateCourse.status}`);
    }

    // 7. Student Enrolls in Course
    console.log('\nTest 6: Student Enrolls in Course (POST /api/courses/:id/enroll)');
    const enrollRes = await studentSession(`/courses/${courseId}/enroll`, 'POST');
    if (enrollRes.status === 201 && enrollRes.data.success) {
      console.log('  ✅ PASSED: Student successfully enrolled with HTTP 201.');
    } else {
      throw new Error(`Enrollment failed: ${JSON.stringify(enrollRes.data)}`);
    }

    // 8. Duplicate Enrollment Prevention
    console.log('\nTest 7: Duplicate Enrollment Prevention');
    const dupEnrollRes = await studentSession(`/courses/${courseId}/enroll`, 'POST');
    if (dupEnrollRes.status === 409) {
      console.log('  ✅ PASSED: Duplicate enrollment blocked with HTTP 409 Conflict.');
    } else {
      throw new Error(`Duplicate enrollment check failed. Status: ${dupEnrollRes.status}`);
    }

    // 9. Fetch Complete Learning Structure
    console.log('\nTest 8: Student fetches Complete Course Learning Structure');
    const detailsRes = await studentSession(`/courses/${courseId}/details`, 'GET');
    if (
      detailsRes.status === 200 &&
      detailsRes.data.modules.length === 1 &&
      detailsRes.data.modules[0].materials.length === 2 &&
      detailsRes.data.enrollment.isEnrolled === true
    ) {
      console.log('  ✅ PASSED: Complete hierarchy (Course ➔ Modules ➔ Materials) fetched.');
    } else {
      throw new Error(`Course details fetch failed: ${JSON.stringify(detailsRes.data)}`);
    }

    // 10. Progress Tracking - Mark Material 1 Complete (50%)
    console.log('\nTest 9: Student Marks Material 1 Complete (50% Progress)');
    const complete1Res = await studentSession(`/materials/${mat1Id}/complete`, 'POST', { completed: true });
    if (complete1Res.status === 200 && complete1Res.data.courseProgressPercentage === 50) {
      console.log('  ✅ PASSED: Material 1 marked complete. Dynamic progress = 50%.');
    } else {
      throw new Error(`Material 1 completion failed: ${JSON.stringify(complete1Res.data)}`);
    }

    // 11. Progress Tracking - Mark Material 2 Complete (100%)
    console.log('\nTest 10: Student Marks Material 2 Complete (100% Progress)');
    const complete2Res = await studentSession(`/materials/${mat2Id}/complete`, 'POST', { completed: true });
    if (complete2Res.status === 200 && complete2Res.data.courseProgressPercentage === 100) {
      console.log('  ✅ PASSED: Material 2 marked complete. Dynamic progress = 100%.');
    } else {
      throw new Error(`Material 2 completion failed: ${JSON.stringify(complete2Res.data)}`);
    }

    // Clean test database records
    await User.deleteMany({ email: /@mod2test\.com$/ });
    await Course.deleteMany({ code: /^TEST/ });
    await Module.deleteMany({ courseId });
    await Material.deleteMany({ moduleId });
    await Enrollment.deleteMany({ courseId });
    await LearningProgress.deleteMany({ courseId });

    console.log('\n==================================================');
    console.log('🎉 ALL MODULE 2 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err) {
    console.error(`\n❌ MODULE 2 TEST FAILED: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }
}

runModule2Tests();
