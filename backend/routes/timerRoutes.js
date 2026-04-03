/**
 * Timer CRUD routes – protected by shop auth middleware.
 */
const express = require('express');
const router = express.Router();
const { authShop } = require('../middleware/authShop');
const timerController = require('../controllers/timerController');

router.use(authShop); // all routes require shop auth

router.get('/', timerController.listTimers);
router.get('/:id', timerController.getTimer);
router.post('/', timerController.createTimer);
router.put('/:id', timerController.updateTimer);
router.delete('/:id', timerController.deleteTimer);

module.exports = router;
