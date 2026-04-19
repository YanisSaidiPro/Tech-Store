const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/techstore';

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

module.exports = { mongoose, connectDb, MONGODB_URI };
