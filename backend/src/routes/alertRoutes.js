const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', (req, res) => {
  res.json({ message: 'Alert routes' });
});

router.get('/upcoming', alertController.getUpcoming);
router.post('/test', alertController.sendTest);
module.exports = router;
