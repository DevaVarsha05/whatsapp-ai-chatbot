const Lead = require('../models/lead');
const { sendButtons } = require('../utils/whatsapp');

// Stage 1: New contact → Send greeting + 3 buttons
const handleGreeting = async (phone, name) => {
  let lead = await Lead.findOne({ phone });

  if (!lead) {
    lead = new Lead({ phone, name, currentStage: 'greeting' });
    await lead.save();
    console.log(`📝 New lead created: ${phone}`);
  } else {
    // Reset for re-engagement
    lead.currentStage = 'greeting';
    await lead.save();
  }

  await sendButtons(
    phone,
    `Welcome to *Shree SivaBalaaji Steels*! 🏗️\nHow can we help you today?`,
    [
      { id: 'quote_request',   title: 'Request a Quote' },
      { id: 'product_catalog', title: 'Product Catalog' },
      { id: 'track_order',     title: 'Track Order' },
    ]
  );
};

const handleIntentSelection = async (phone, buttonId) => {
  let lead = await Lead.findOne({ phone });
  if (!lead) return;
 
  lead.intent = buttonId;
 
  if (buttonId === 'quote_request') {
    lead.currentStage = 'product_routing';
    await lead.save();
    return 'go_to_stage2';
  }
 
  if (buttonId === 'product_catalog') {
    lead.currentStage = 'greeting';
    await lead.save();
    return 'send_catalog';
  }
 
  if (buttonId === 'track_order') {
    lead.currentStage = 'greeting';
    await lead.save();
    return 'send_tracking';
  }
};
 
module.exports = { handleGreeting, handleIntentSelection };