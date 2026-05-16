const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
  });
  console.log('MongoDB connected successfully');
}

module.exports = connectDB;
