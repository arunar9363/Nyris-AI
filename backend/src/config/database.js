const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 5000,
    });
    console.log('MongoDB connected.');
  } catch (error) {
    const code = error.code || error.cause?.code;
    if (code === 'ENOTFOUND') {
      const hint = uri?.startsWith('mongodb+srv://')
        ? 'Verify the cluster is active and check the SRV hostname in MONGODB_URI. Use the Atlas standard connection string if SRV resolution fails.'
        : 'Check that the hostnames in MONGODB_URI match the active database cluster.';
      throw new Error('MongoDB DNS lookup failed (ENOTFOUND). ' + hint);
    }
    throw new Error(`MongoDB connection failed (${error.code || error.name}). Check the configured URI, DNS, and network access.`);
  }
};

module.exports = connectDB;
