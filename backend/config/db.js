/**
 * Database configuration – exports connection options.
 * The actual connection is handled in server.js.
 */
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/countdown_timer',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};
