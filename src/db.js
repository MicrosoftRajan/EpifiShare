const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 8000) {
      throw new Error('Atlas authentication failed — check username/password in MONGODB_URI');
    }
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('timed out')) {
      throw new Error(
        `${err.message} — in Atlas go to Network Access and allow 0.0.0.0/0 so Render can connect`
      );
    }
    throw err;
  }
}

module.exports = connectDB;
