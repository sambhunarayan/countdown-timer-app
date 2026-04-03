/**
 * Entry point for the Countdown Timer backend.
 * Sets up Express, connects to MongoDB, and mounts all routes.
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xssClean = require('xss-clean');

const timerRoutes = require('./routes/timerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const productRoutes = require('./routes/productRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & parsing middleware ────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001' }));
app.use(express.json({ limit: '10kb' })); // limit body size
app.use(xssClean());                       // sanitize inputs
app.use(morgan('dev'));

// ── Rate limiting ────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/timers', timerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ── Database connection & server start ───────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/countdown_timer';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app; // exported for testing
