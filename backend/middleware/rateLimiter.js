/**
 * Rate limiting middleware.
 * - General API: 100 req / 15 min per IP
 * - Impression tracking: 300 req / 15 min (higher because storefront calls are frequent)
 */
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const impressionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, impressionLimiter };
