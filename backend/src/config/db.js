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

        // Seed comprehensive 20-student demo dataset
        const seedDemoData = require('./demoSeeder');
        await seedDemoData();
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
