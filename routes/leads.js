const express = require('express');
const router  = express.Router();
const Lead    = require('../models/lead');

router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
