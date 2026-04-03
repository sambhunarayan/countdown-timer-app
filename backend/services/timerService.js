/**
 * Timer service – business logic layer between controllers and the database.
 * Keeps controllers thin and logic testable.
 */
const Timer = require('../models/Timer');

class TimerService {
  /** List all timers for a shop, newest first */
  async listTimers(shopId) {
    return Timer.find({ shopId }).sort({ createdAt: -1 }).lean();
  }

  /** Get a single timer (ensures it belongs to the shop) */
  async getTimer(shopId, timerId) {
    const timer = await Timer.findOne({ _id: timerId, shopId });
    if (!timer) throw Object.assign(new Error('Timer not found'), { statusCode: 404 });
    return timer;
  }

  /** Create a new timer */
  async createTimer(shopId, data) {
    return Timer.create({ ...data, shopId });
  }

  /** Update an existing timer */
  async updateTimer(shopId, timerId, data) {
    const timer = await Timer.findOneAndUpdate(
      { _id: timerId, shopId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!timer) throw Object.assign(new Error('Timer not found'), { statusCode: 404 });
    return timer;
  }

  /** Delete a timer */
  async deleteTimer(shopId, timerId) {
    const timer = await Timer.findOneAndDelete({ _id: timerId, shopId });
    if (!timer) throw Object.assign(new Error('Timer not found'), { statusCode: 404 });
    return timer;
  }

  /**
   * Get active timers for the storefront widget.
   * Returns only timers whose status is "active" right now,
   * filtered by optional productId / collectionId.
   */
  async getActiveTimers(shopId, { productId, collectionId } = {}) {
    const now = new Date();
    const query = {
      shopId,
      $or: [
        // Fixed timers that are currently active
        { timerType: 'fixed', startTime: { $lte: now }, endTime: { $gte: now } },
        // Evergreen timers are always "active"
        { timerType: 'evergreen' },
      ],
    };

    const timers = await Timer.find(query).lean();

    // Filter by targeting
    return timers.filter((t) => {
      if (t.targeting?.type === 'all') return true;
      if (t.targeting?.type === 'specific_products' && productId) {
        return t.targeting.productIds?.includes(productId);
      }
      if (t.targeting?.type === 'specific_collections' && collectionId) {
        return t.targeting.collectionIds?.includes(collectionId);
      }
      return t.targeting?.type === 'all';
    });
  }

  /** Increment impression counter */
  async trackImpression(timerId) {
    const timer = await Timer.findByIdAndUpdate(
      timerId,
      { $inc: { impressions: 1 } },
      { new: true }
    );
    if (!timer) throw Object.assign(new Error('Timer not found'), { statusCode: 404 });
    return { impressions: timer.impressions };
  }
}

module.exports = new TimerService();
