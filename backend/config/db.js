const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection promise is currently in-flight, await it
  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/getsy';

  try {
    cachedConnection = mongoose.connect(mongoURI);
    const conn = await cachedConnection;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
