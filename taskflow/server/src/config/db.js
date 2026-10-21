const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('\n[db] Could not connect to MongoDB.');
    console.error(`[db] Reason: ${err.message}`);
    console.error('[db] Check that MongoDB is running (local) or that your Atlas URI, user, password and IP allow-list are correct.\n');
    process.exit(1);
  }
}

module.exports = connectDB;
