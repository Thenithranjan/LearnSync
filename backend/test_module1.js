const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const app = require('./src/app');

let server;

async function runTests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Module 1 Verification Tests');
  console.log('==================================================\n');

  try {
    // Connect DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edupulse');
    console.log('✅ Connected to MongoDB for testing.');

    // Clean test database users
    await User.deleteMany({ email: /@test\.com$/ });

    // Start server on port 5001 for testing
    const PORT = 5001;
    server = app.listen(PORT);
    console.log(`✅ Test server running on port ${PORT}.\n`);

    const baseUrl = `http://localhost:${PORT}/api`;

    // Helper for fetch with cookie tracking
    let cookies = '';

    const request = async (endpoint, method = 'GET', body = null, useAuthCookie = false) => {
      const headers = { 'Content-Type': 'application/json' };
      if (useAuthCookie && cookies) {
        headers['Cookie'] = cookies;
      }

      const options = { method, headers };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await res.json().catch(() => ({}));
      
      // Capture set-cookie
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        cookies = setCookie.split(';')[0];
      }

      return { status: res.status, data, headers: res.headers };
    };

    // 1. ADMIN registration attempt (MUST BE BLOCKED)
    console.log('Test 1: Public ADMIN registration attempt');
    const adminReg = await request('/auth/register', 'POST', {
      name: 'Hacker Admin',
      email: 'adminhack@test.com',
      password: 'Password123',
      role: 'ADMIN',
      department: 'Management'
    });
    if (adminReg.status === 403 && adminReg.data.success === false) {
      console.log('  ✅ PASSED: Public ADMIN registration blocked with HTTP 403.');
    } else {
      throw new Error(`Test 1 Failed. Status: ${adminReg.status}, Data: ${JSON.stringify(adminReg.data)}`);
    }

    // 2. Valid Student registration
    console.log('\nTest 2: Valid Student registration');
    const studentReg = await request('/auth/register', 'POST', {
      name: 'Alice Student',
      email: 'alice@test.com',
      password: 'Password123',
      role: 'STUDENT',
      department: 'Computer Science'
    });
    if (studentReg.status === 201 && studentReg.data.user.role === 'STUDENT' && !studentReg.data.user.password) {
      console.log('  ✅ PASSED: Student registered successfully with HTTP 201. Password not returned.');
    } else {
      throw new Error(`Test 2 Failed. Status: ${studentReg.status}, Data: ${JSON.stringify(studentReg.data)}`);
    }

    // 3. Duplicate email registration
    console.log('\nTest 3: Duplicate email registration');
    const dupReg = await request('/auth/register', 'POST', {
      name: 'Alice Duplicate',
      email: 'alice@test.com',
      password: 'Password123',
      role: 'STUDENT'
    });
    if (dupReg.status === 409) {
      console.log('  ✅ PASSED: Duplicate email registration rejected with HTTP 409 Conflict.');
    } else {
      throw new Error(`Test 3 Failed. Status: ${dupReg.status}`);
    }

    // 4. Valid Faculty registration
    console.log('\nTest 4: Valid Faculty registration');
    const facultyReg = await request('/auth/register', 'POST', {
      name: 'Prof Bob Faculty',
      email: 'bob@test.com',
      password: 'Password123',
      role: 'FACULTY',
      department: 'Data Science'
    });
    if (facultyReg.status === 201 && facultyReg.data.user.role === 'FACULTY') {
      console.log('  ✅ PASSED: Faculty registered successfully with HTTP 201.');
    } else {
      throw new Error(`Test 4 Failed. Status: ${facultyReg.status}`);
    }

    // 5. Login Student
    console.log('\nTest 5: Student Login');
    const studentLogin = await request('/auth/login', 'POST', {
      email: 'alice@test.com',
      password: 'Password123'
    });
    if (studentLogin.status === 200 && studentLogin.data.success && cookies.includes('token=')) {
      console.log('  ✅ PASSED: Student logged in, HTTP-only cookie set.');
    } else {
      throw new Error(`Test 5 Failed. Status: ${studentLogin.status}`);
    }

    // 6. GET /api/auth/me (Session restoration)
    console.log('\nTest 6: GET /api/auth/me with cookie');
    const meRes = await request('/auth/me', 'GET', null, true);
    if (meRes.status === 200 && meRes.data.user.email === 'alice@test.com') {
      console.log('  ✅ PASSED: Session restored via GET /api/auth/me.');
    } else {
      throw new Error(`Test 6 Failed. Status: ${meRes.status}`);
    }

    // 7. Role Authorization: Student attempts Admin endpoint
    console.log('\nTest 7: Student attempts /api/admin/test');
    const adminTestByStudent = await request('/admin/test', 'GET', null, true);
    if (adminTestByStudent.status === 403) {
      console.log('  ✅ PASSED: Student denied access to admin endpoint with HTTP 403.');
    } else {
      throw new Error(`Test 7 Failed. Status: ${adminTestByStudent.status}`);
    }

    // 8. Role Authorization: Student attempts Student endpoint
    console.log('\nTest 8: Student accesses /api/student/test');
    const studentTestByStudent = await request('/student/test', 'GET', null, true);
    if (studentTestByStudent.status === 200 && studentTestByStudent.data.accessGranted) {
      console.log('  ✅ PASSED: Student granted access to student endpoint with HTTP 200.');
    } else {
      throw new Error(`Test 8 Failed. Status: ${studentTestByStudent.status}`);
    }

    // 9. Profile update
    console.log('\nTest 9: Profile Update (PUT /api/users/profile)');
    const profileUpdate = await request(
      '/users/profile',
      'PUT',
      { name: 'Alice Updated', department: 'Artificial Intelligence' },
      true
    );
    if (profileUpdate.status === 200 && profileUpdate.data.user.name === 'Alice Updated') {
      console.log('  ✅ PASSED: Profile name & department updated successfully.');
    } else {
      throw new Error(`Test 9 Failed. Status: ${profileUpdate.status}`);
    }

    // 10. Change Password & Re-login
    console.log('\nTest 10: Change Password & Verify');
    const changePass = await request(
      '/auth/change-password',
      'PUT',
      { currentPassword: 'Password123', newPassword: 'NewPassword456' },
      true
    );
    if (changePass.status === 200) {
      console.log('  ✅ PASSED: Password changed.');
    } else {
      throw new Error(`Test 10 Failed. Status: ${changePass.status}`);
    }

    // Re-login with new password
    const relogin = await request('/auth/login', 'POST', {
      email: 'alice@test.com',
      password: 'NewPassword456'
    });
    if (relogin.status === 200) {
      console.log('  ✅ PASSED: Re-logged in with new password.');
    } else {
      throw new Error(`Re-login Failed. Status: ${relogin.status}`);
    }

    // 11. Logout
    console.log('\nTest 11: Logout (POST /api/auth/logout)');
    const logoutRes = await request('/auth/logout', 'POST', null, true);
    if (logoutRes.status === 200) {
      console.log('  ✅ PASSED: Logout successful.');
    } else {
      throw new Error(`Logout Failed. Status: ${logoutRes.status}`);
    }

    // Clean up test database records
    await User.deleteMany({ email: /@test\.com$/ });

    console.log('\n==================================================');
    console.log('🎉 ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err) {
    console.error(`\n❌ TEST SUITE FAILED: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests();
