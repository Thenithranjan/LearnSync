const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    
    // In development mode, fallback to in-memory MongoDB instance so full platform is immediately usable
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MongoDB] Initializing in-memory MongoDB development instance...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`[MongoDB] ✅ Connected to in-memory MongoDB dev database: ${conn.connection.host}`);

        // Seed default demo accounts so the user can immediately log in
        const User = require('../models/User');
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('[Seed] Creating demo accounts for Student, Faculty, and Admin...');
          const demoAccounts = [
            {
              name: 'Dr. Alan Faculty',
              email: 'faculty@example.com',
              password: 'Password123!',
              role: 'FACULTY',
              department: 'Computer Science'
            },
            {
              name: 'John Student',
              email: 'student@example.com',
              password: 'Password123!',
              role: 'STUDENT',
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

          for (const acc of demoAccounts) {
            await User.create(acc);
          }

          console.log('[Seed] ✅ Demo accounts created successfully:');
          console.log('       👩‍🎓 Student: student@example.com / Password123!');
          console.log('       👨‍🏫 Faculty: faculty@example.com / Password123!');
          console.log('       🛡️ Admin:   admin@example.com   / Password123!');
        }
      } catch (memErr) {
        console.error(`[MongoDB Error] Failed to initialize in-memory database: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
