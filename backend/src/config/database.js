const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 5000,
    });
    console.log('MongoDB connected.');
  } catch (error) {
    throw new Error(`MongoDB connection failed (${error.code || error.name}). Check the configured URI, DNS, and network access.`);
  }
};

module.exports = connectDB;
