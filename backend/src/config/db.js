const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB: ${error.message}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MongoDB] Initializing in-memory MongoDB development instance...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`[MongoDB] ✅ Connected to in-memory MongoDB dev database: ${conn.connection.host}`);
        cached.conn = conn;
        return cached.conn;
      } catch (memErr) {
        console.error(`[MongoDB Error] Failed to initialize in-memory database: ${memErr.message}`);
        throw memErr;
      }
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;

