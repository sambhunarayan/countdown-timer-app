/**
 * Timer controller – handles HTTP request/response for timer CRUD.
 * Delegates business logic to timerService.
 */
const timerService = require('../services/timerService');
const { timerSchema, updateTimerSchema } = require('./validators');

/** GET /api/timers – list all timers for the authenticated shop */
exports.listTimers = async (req, res, next) => {
  try {
    const timers = await timerService.listTimers(req.shopId);
    res.json({ success: true, data: timers });
  } catch (err) {
    next(err);
  }
};

/** GET /api/timers/:id */
exports.getTimer = async (req, res, next) => {
  try {
    const timer = await timerService.getTimer(req.shopId, req.params.id);
    res.json({ success: true, data: timer });
  } catch (err) {
    next(err);
  }
};

/** POST /api/timers – create a new timer */
exports.createTimer = async (req, res, next) => {
  try {
    const { error, value } = timerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }
    const timer = await timerService.createTimer(req.shopId, value);
    res.status(201).json({ success: true, data: timer });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/timers/:id */
exports.updateTimer = async (req, res, next) => {
  try {
    const { error, value } = updateTimerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }
    const timer = await timerService.updateTimer(req.shopId, req.params.id, value);
    res.json({ success: true, data: timer });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/timers/:id */
exports.deleteTimer = async (req, res, next) => {
  try {
    await timerService.deleteTimer(req.shopId, req.params.id);
    res.json({ success: true, message: 'Timer deleted' });
  } catch (err) {
    next(err);
  }
};
