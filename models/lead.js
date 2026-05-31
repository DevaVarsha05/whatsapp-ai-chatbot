const mongoose = require('mongoose');

// In-memory store
const leads = {};

const Lead = {
  findOne: async ({ phone }) => leads[phone] || null,
  prototype: {},
};

function LeadModel(data) {
  Object.assign(this, data);
  this.save = async () => { leads[this.phone] = this; };
}

LeadModel.findOne = async ({ phone }) => {
  if (!leads[phone]) return null;
  const obj = leads[phone];
  obj.save = async () => { leads[phone] = obj; };
  return obj;
};

module.exports = LeadModel;

