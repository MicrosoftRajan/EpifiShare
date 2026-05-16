const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Set it in your .env file.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected successfully');
}

module.exports = connectDB;
