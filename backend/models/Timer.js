/**
 * Timer model – represents a single countdown timer belonging to a shop.
 *
 * Fields:
 *  shopId          – Shopify shop domain (multi-tenant key)
 *  name            – Human-readable label
 *  timerType       – "fixed" (start/end) or "evergreen" (session-based)
 *  startTime/endTime – Used by fixed timers
 *  evergreenDuration – Minutes for evergreen timers
 *  targeting       – Which products/collections to show the timer on
 *  customization   – Visual settings (colors, text, position)
 *  impressions     – Simple counter incremented by the storefront widget
 *  status          – Computed virtual: active | scheduled | expired
 */
const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema(
  {
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    timerType: {
      type: String,
      enum: ['fixed', 'evergreen'],
      required: true,
    },

    // Fixed timer fields
    startTime: { type: Date },
    endTime: { type: Date },

    // Evergreen timer fields (duration in minutes)
    evergreenDuration: { type: Number, min: 1 },

    // Targeting rules
    targeting: {
      type: {
        type: String,
        enum: ['all', 'specific_products', 'specific_collections'],
        default: 'all',
      },
      productIds: [String],
      collectionIds: [String],
    },

    // Visual customization
    customization: {
      backgroundColor: { type: String, default: '#000000' },
      textColor: { type: String, default: '#FFFFFF' },
      accentColor: { type: String, default: '#FF4444' },
      headingText: { type: String, default: 'Hurry! Sale ends in:' },
      expiredText: { type: String, default: 'This offer has expired.' },
      position: {
        type: String,
        enum: ['top', 'bottom', 'inline'],
        default: 'top',
      },
      showUrgencyEffect: { type: Boolean, default: true },
    },

    impressions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field: compute status based on current time vs start/end.
 */
timerSchema.virtual('status').get(function () {
  if (this.timerType === 'evergreen') return 'active';
  const now = new Date();
  if (this.startTime > now) return 'scheduled';
  if (this.endTime < now) return 'expired';
  return 'active';
});

// Compound index for fast per-shop queries
timerSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model('Timer', timerSchema);
