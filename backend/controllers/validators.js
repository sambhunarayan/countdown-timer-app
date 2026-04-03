/**
 * Joi validation schemas for timer input.
 */
const Joi = require('joi');

const customizationSchema = Joi.object({
  backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  textColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  accentColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FF4444'),
  headingText: Joi.string().max(200).default('Hurry! Sale ends in:'),
  expiredText: Joi.string().max(200).default('This offer has expired.'),
  position: Joi.string().valid('top', 'bottom', 'inline').default('top'),
  showUrgencyEffect: Joi.boolean().default(true),
});

const targetingSchema = Joi.object({
  type: Joi.string().valid('all', 'specific_products', 'specific_collections').default('all'),
  productIds: Joi.array().items(Joi.string()).default([]),
  collectionIds: Joi.array().items(Joi.string()).default([]),
});

const timerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  timerType: Joi.string().valid('fixed', 'evergreen').required(),
  startTime: Joi.date().allow('', null).when('timerType', { is: 'fixed', then: Joi.required() }),
  endTime: Joi.date().allow('', null).greater(Joi.ref('startTime')).when('timerType', { is: 'fixed', then: Joi.required() }),
  evergreenDuration: Joi.number().min(1).when('timerType', { is: 'evergreen', then: Joi.required() }),
  targeting: targetingSchema.default(),
  customization: customizationSchema.default(),
});

const updateTimerSchema = timerSchema.fork(
  ['name', 'timerType'],
  (schema) => schema.optional()
);

module.exports = { timerSchema, updateTimerSchema };
