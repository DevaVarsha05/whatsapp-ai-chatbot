const express = require('express');
const router  = express.Router();
const Lead    = require('../models/lead');
const Order   = require('../models/order');

router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ leads, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;