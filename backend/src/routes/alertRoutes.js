const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Alert routes' });
});

module.exports = router;
