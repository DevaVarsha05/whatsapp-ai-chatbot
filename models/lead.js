const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  phone:        { type: String, required: true, unique: true },
  name:         { type: String, default: 'Customer' },
  currentStage: { type: String, default: 'greeting' },

  // Stage 1
  intent: String,

  // Stage 2 — new hierarchy fields
  mainCategory:      String,   // 'roofing_products' | 'structural_fastening' | 'use_cases'
  
  // Stage 3 — Quote form
  productType:       String,   // sub-category id e.g. 'roofing_sheets', 'pipes'
  quoteStep:         String,   // 'brand' | 'sheet_type' | 'thickness' | 'pincode' | 'done'
  selectedBrand:     String,
  selectedSheetType: String,   // only for roofing_sheets
  selectedThickness: String,
  deliveryPincode:   String,

  // Catalog form
  catalogProduct:     String,
  catalogFormStep:    { type: Number, default: 0 },
  catalogGrade:       String,
  catalogDiameter:    String,
  catalogQuantity:    Number,
  catalogBrand:       String,
  catalogPincode:     String,
  catalogCity:        String,
  catalogTimeline:    String,
  catalogContact:     String,
  catalogCompany:     String,
  catalogProjectType: String,

  // AI conversation history
  messages: [
    {
      role:    { type: String, enum: ['user', 'assistant'] },
      content: String,
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);