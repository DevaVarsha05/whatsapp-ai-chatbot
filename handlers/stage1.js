const Lead = require('../models/lead');
const { sendMainCategoryMenu } = require('./stage2');

const handleGreeting = async (phone, name) => {
  let lead = await Lead.findOne({ phone });

  if (!lead) {
    lead = new Lead({ phone, name, currentStage: 'main_category' });
    await lead.save();
    console.log(`📝 New lead created: ${phone}`);
  } else {
    lead.currentStage = 'main_category';
    await lead.save();
  }

  await sendMainCategoryMenu(phone);
};

module.exports = { handleGreeting };