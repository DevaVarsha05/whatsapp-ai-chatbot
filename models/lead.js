const mongoose = require('mongoose');

// // // In-memory store
// // const leads = {};

// // const Lead = {
// //   findOne: async ({ phone }) => leads[phone] || null,
// //   prototype: {},
// // };

// // function LeadModel(data) {
// //   Object.assign(this, data);
// //   this.save = async () => { leads[this.phone] = this; };
// // }

// // LeadModel.findOne = async ({ phone }) => {
// //   if (!leads[phone]) return null;
// //   const obj = leads[phone];
// //   obj.save = async () => { leads[phone] = obj; };
// //   return obj;
// // };

// module.exports = LeadModel;

const leadSchema = new mongoose.Schema({
  phone:        { type: String, required: true, unique: true },
  name:         { type: String, default: 'Customer' },
  currentStage: { type: String, default: 'greeting' },
 
  // Quote form
  intent:            String,
  productType:       String,
  quoteStep:         String,
  selectedBrand:     String,
  selectedThickness: String,
  deliveryPincode:   String,

  // Catalog form
  catalogProduct:     String,
  catalogFormStep:    { type: Number, default: 0 },
  catalogQuantity:    Number,
  catalogPincode:     String,
  catalogCity:        String,
  catalogTimeline:    String,
  catalogContact:     String,
  catalogCompany:     String,
  catalogProjectType: String,


   messages: [
    {
      role:    { type: String, enum: ['user', 'assistant'] },
      content: String,
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);