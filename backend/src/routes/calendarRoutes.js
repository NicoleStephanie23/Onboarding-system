const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.get('/', (req, res) => {
  res.json({ message: 'Calendar routes' });
});
router.get('/', calendarController.getAll);
router.post('/', calendarController.create);
router.get('/upcoming', calendarController.getUpcomingEvents);
module.exports = router;
