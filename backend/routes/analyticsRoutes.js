/**
 * Analytics routes – public (called by the storefront widget).
 * Has its own rate limiter for impression tracking.
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { impressionLimiter } = require('../middleware/rateLimiter');

router.get('/active-timers', analyticsController.getActiveTimers);
router.post('/impression/:timerId', impressionLimiter, analyticsController.trackImpression);

module.exports = router;
