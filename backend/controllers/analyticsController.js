/**
 * Analytics controller – storefront-facing endpoints.
 * These are called by the widget (no shop auth required for active timers).
 */
const timerService = require('../services/timerService');

/** GET /api/analytics/active-timers?shopId=x&productId=y */
exports.getActiveTimers = async (req, res, next) => {
  try {
    const { shopId, productId, collectionId } = req.query;
    if (!shopId) {
      return res.status(400).json({ success: false, error: 'shopId is required' });
    }
    const timers = await timerService.getActiveTimers(shopId, { productId, collectionId });

    // Set cache header for CDN / browser caching (30 seconds)
    res.set('Cache-Control', 'public, max-age=30, s-maxage=30');
    res.json({ success: true, data: timers });
  } catch (err) {
    next(err);
  }
};

/** POST /api/analytics/impression/:timerId */
exports.trackImpression = async (req, res, next) => {
  try {
    const result = await timerService.trackImpression(req.params.timerId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
