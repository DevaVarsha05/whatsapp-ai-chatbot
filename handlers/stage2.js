const Lead = require('../models/lead');
const { sendListMenu } = require('../utils/whatsapp');

// Stage 2: Send product type list menu
const sendProductMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Excellent! To route your request to the right department, please tell us what type of steel you require:`,
    'Select Product Type',
    [{
      title: 'Steel Products',
      rows: [
        { id: 'tmt_bars',         title: 'TMT Bars (Fe500D)',    description: 'Reinforcement bars for construction' },
        { id: 'structural_steel', title: 'Structural Steel',     description: 'Beams, Angles & Channels' },
        { id: 'hr_cr_coils',      title: 'HR/CR Coils & Sheets', description: 'Hot rolled & cold rolled products' },
        { id: 'pipes_tubes',      title: 'Pipes & Tubes',        description: 'Round, square & rectangular pipes' },
        { id: 'galvanized',       title: 'Galvanized Products',  description: 'Galvanized sheets & coils' },
      ],
    }]
  );
};

// Stage 2: User selected a product → move to Stage 3
const handleProductSelection = async (phone, listItemId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.productType = listItemId;
  lead.currentStage = 'quote_form';
  await lead.save();

  console.log(`✅ Stage 2 done for ${phone}: ${listItemId}`);
  return 'go_to_stage3';
};

module.exports = { sendProductMenu, handleProductSelection };
