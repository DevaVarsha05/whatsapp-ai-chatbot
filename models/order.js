const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  phone:   { type: String, required: true },
  name:    String,
  product: String,
  brand:   String,
  size:    String,
  pincode: String,
  source:  { type: String, default: 'text' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);