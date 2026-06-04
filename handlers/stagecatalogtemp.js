const Lead = require('../models/lead');
const { sendText, sendListMenu, sendButtons } = require('../utils/whatsapp');
const { sendMainCategoryMenu } = require('./stage2');

const VALID_PINCODES = [
  '624001',
  '624002',
  '624003',
  '624004',
  '624005',
];
 
// Product categories
const PRODUCT_CATEGORIES = [
  { id: 'tmt_bars',         title: 'TMT Bars',              description: 'ARS550D - 8mm to 32mm' },
  { id: 'roofing_sheets',   title: 'Roofing Sheets',        description: 'JSW Everglow, Colouron+...' },
  { id: 'steel_pipes',      title: 'Steel Pipes',           description: 'MS Pipes, GP Pipes' },
  { id: 'cement',           title: 'Cement',                description: 'Dalmia Cement' },
  { id: 'fibre_boards',     title: 'Fibre Cement Boards',   description: 'Everest 6mm, 8mm, 10mm' },
  { id: 'accessories',      title: 'Accessories',           description: 'TATA Screws, Louvers...' },
];
 const CATALOG_STEPS = [
  { key: 'catalogGrade',       label: 'Steel Grade',      type: 'text',     prompt: '📐 Enter *Steel Grade* (e.g., Fe500, Fe550D):' },
  { key: 'catalogDiameter',    label: 'Diameter',         type: 'text',     prompt: '📏 Enter *Diameter* (e.g., 8mm, 12mm):' },
  { key: 'catalogQuantity',    label: 'Quantity (Tonnes)', type: 'text',    prompt: '⚖️ Enter *Quantity* in Tonnes (e.g., 25):' },
  { key: 'catalogBrand',       label: 'Brand',            type: 'text',     prompt: '🏷️ Enter *Brand* name:' },
  { key: 'catalogPincode',     label: 'Pincode',          type: 'text',     prompt: '📍 Enter your *Delivery Pincode* (6 digits):' },
  { key: 'catalogCity',        label: 'City',             type: 'text',     prompt: '🏙️ Enter your *City*:' },
  { key: 'catalogTimeline',    label: 'Timeline',         type: 'text',     prompt: '📅 Enter your *Required Timeline* (e.g., 1 week):' },
  { key: 'catalogContact',     label: 'Contact Number',   type: 'text',     prompt: '📞 Enter your *Contact Number*:' },
  { key: 'catalogCompany',     label: 'Company Name',     type: 'text',     prompt: '🏢 Enter your *Company Name* (or type NA):' },
  { key: 'catalogProjectType', label: 'Project Type',     type: 'text',     prompt: '🏗️ Enter *Project Type* (e.g., Residential, Commercial):' },
];
// ── Step 1: Show product category list ───────────────────────────
const sendCatalogMenu = async (phone) => {
  await sendListMenu(
    phone,
    `📦 *Shree SivaBalaaji Steels — Product Catalog*\n\nPlease select the product you are interested in:`,
    'Select Product',
    [{
      title: 'Our Products',
      rows: PRODUCT_CATEGORIES,
    }]
  );
};
 
// ── Step 2: Product selected → show details + ask quote ──────────
const handleCatalogProductSelect = async (phone, productId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;
 
  let details = '';
 
  switch (productId) {
    case 'tmt_bars':
      details =
        `🔩 *TMT Bars*\n\n` +
        `• Brand: ARS550D TMT Bars\n` +
        `• Grades: Fe500, Fe500D, Fe550, Fe550D\n` +
        `• Sizes: 8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm\n\n` +
        `✅ Ideal for: Residential, Commercial & Infrastructure construction`;
      break;
 
    case 'roofing_sheets':
      details =
        `🏠 *Roofing Sheets*\n\n` +
        `• Brands: JSW Everglow, Colouron+, Pragati+, Silveron+, Vishwas+, ColorVista\n` +
        `• Types: Profile Sheet, Crimp Sheet, Arch Sheet, Profile Ridge Sheet, Plain Sheet\n` +
        `• Thickness: 0.35mm, 0.40mm, 0.45mm, 0.47mm, 0.50mm, 0.60mm\n\n` +
        `✅ Ideal for: House Terraces, Car Parking, Godowns, Poultry Farms`;
      break;
 
    case 'steel_pipes':
      details =
        `🔧 *Steel Pipes*\n\n` +
        `• Types: MS Pipes, GP Pipes\n` +
        `• Sizes: 1mm, 1.2mm, 1.6mm, 2mm, 2.5mm, 3mm, 4mm\n\n` +
        `✅ Ideal for: Construction & Industrial use`;
      break;
 
    case 'cement':
      details =
        `🏗️ *Cement*\n\n` +
        `• Brand: Dalmia Cement\n\n` +
        `✅ Premium quality cement for all construction needs`;
      break;
 
    case 'fibre_boards':
      details =
        `📋 *Fibre Cement Boards*\n\n` +
        `• Brand: Everest Fibre Cement Boards / Panels\n` +
        `• Types: Standard Board, HD Board\n` +
        `• Sizes: 6mm, 8mm, 10mm\n\n` +
        `✅ Ideal for: Wall panels, Ceilings & Partitions`;
      break;
 
    case 'accessories':
      details =
        `🔨 *Accessories*\n\n` +
        `• TATA Screws: 19mm, 25mm, 55mm\n` +
        `• Louvers, Roof Ventilators\n` +
        `• Thoovanam: 6", 8"\n` +
        `• Mugappu\n` +
        `• JSW – L Corner, Gutter, Ridge, L Flashing, Down Pipe, Barge Cap\n\n` +
        `✅ Complete roofing accessories`;
      break;
 
    default:
      details = '❌ Product not found.';
  }
 
  // Send product details
  await sendText(phone, details);
 
  // Ask if they want to request a quote
  await sendButtons(phone,
    `Would you like to request a quote for this product?`,
    [
      { id: `catalog_quote_${productId}`, title: '📋 Request Quote' },
      { id: 'catalog_back',               title: '🔙 View Other Products' },
      { id: 'catalog_done',               title: '✅ Done' },
    ]
  );
 
  lead.currentStage  = 'catalog_action';
  lead.catalogProduct = productId;
  await lead.save();
};
 
// ── Step 3: Handle quote/back/done button ────────────────────────
const handleCatalogAction = async (phone, buttonId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;
 
  if (buttonId === 'catalog_back') {
    lead.currentStage = 'catalog_browse';
    await lead.save();
    await sendCatalogMenu(phone);
    return;
  }
 
  if (buttonId === 'catalog_done') {
  lead.currentStage = 'main_category';
  await lead.save();
  await sendText(phone, '✅ Thank you for browsing our catalog!');
  await sendMainCategoryMenu(phone);
  return;
}
 
  if (buttonId.startsWith('catalog_quote_')) {
    // Start catalog quote form
    lead.currentStage    = 'catalog_form';
    lead.catalogFormStep = 0;
    await lead.save();
 
    await sendText(phone,
      `📋 Let's get your *Quote* ready!\nI'll ask you a few quick questions.`
    );
    await sendCatalogStep(phone, 0);
  }
};
 
// ── Send current catalog form step ───────────────────────────────
const sendCatalogStep = async (phone, stepIndex) => {
  const step = CATALOG_STEPS[stepIndex];
  if (!step) return;
 
  if (step.type === 'dropdown') {
    await sendListMenu(
      phone,
      `Please select your *${step.label}*:`,
      `Choose ${step.label}`,
      [{
        title: step.label,
        rows: step.options.map(o => ({ id: o.id, title: o.label })),
      }]
    );
  } else {
    await sendText(phone, step.prompt);
  }
};
 
// ── Handle catalog form answers ───────────────────────────────────
const handleCatalogFormAnswer = async (phone, answer) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;
 
  const stepIndex = lead.catalogFormStep || 0;
  const step      = CATALOG_STEPS[stepIndex];
  if (!step) return;
 
  // Validate fields
  if (step.key === 'catalogQuantity') {
    const num = parseFloat(answer);
    if (isNaN(num)) {
      await sendText(phone, '⚠️ Please enter a valid number for quantity (e.g., 25)');
      return;
    }
    lead.catalogQuantity = num;
 
  } else if (step.key === 'catalogPincode') {
    const pincode = answer.trim();
    if (!/^\d{6}$/.test(pincode)) {
      await sendText(phone, '⚠️ Please enter a valid *6-digit pincode* (e.g., 624001)');
      return;
    }
    if (!VALID_PINCODES.includes(pincode)) {
      await sendText(phone,
        `❌ *Sorry!* We don't deliver to pincode *${pincode}*.\n\n` +
        `We serve:\n` +
        VALID_PINCODES.map(p => `• ${p}`).join('\n') +
        `\n\nPlease enter a valid pincode.`
      );
      return;
    }
    lead.catalogPincode = pincode;
 
  } else {
    lead[step.key] = answer;
  }
 
  const nextStep = stepIndex + 1;
  lead.catalogFormStep = nextStep;
  await lead.save();
 
  if (nextStep < CATALOG_STEPS.length) {
    await sendCatalogStep(phone, nextStep);
  } else {
    lead.currentStage = 'completed';
    await lead.save();
    await sendCatalogSummary(phone, lead);
  }
};
 
// ── Final catalog quote summary ───────────────────────────────────
const sendCatalogSummary = async (phone, lead) => {
  const summary = `
✅ *Thank you! Your quote request has been received.*
 
📋 *Quote Summary:*
• Product     : ${lead.catalogProduct?.replace(/_/g, ' ').toUpperCase()}
• Steel Grade : ${lead.catalogGrade}
• Diameter    : ${lead.catalogDiameter}
• Quantity    : ${lead.catalogQuantity} Tonnes
• Brand       : ${lead.catalogBrand}
• Pincode     : ${lead.catalogPincode}
• City        : ${lead.catalogCity}
• Timeline    : ${lead.catalogTimeline}
• Contact     : ${lead.catalogContact}
• Company     : ${lead.catalogCompany}
• Project     : ${lead.catalogProjectType}
 
Our team will call you within *2 business hours*. 🤝
  `.trim();
 
  await sendText(phone, summary);
};
 
module.exports = {
  sendCatalogMenu,
  handleCatalogProductSelect,
  handleCatalogAction,
  handleCatalogFormAnswer,
};