const Lead = require('../models/lead');
const { sendText } = require('../utils/whatsapp');
const { sendThicknessMenu, sendSheetTypeMenu, PRODUCTS } = require('./stage2');

// Valid Pincodes
const VALID_PINCODES = [
  '624001',
  '624002',
  '624003',
  '624004',
  '624005',
];

const handleUseCaseItemSelection = async (phone, itemId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  // Show coming soon message
  await sendText(phone, '⚠️ *Coming Soon!*\nThis item is currently not available, we will update soon. Please explore our other products!');

  // Reset stage to main menu
  lead.currentStage = 'main_category';
  lead.quoteStep    = '';
  await lead.save();

  // Send Main Menu again
  await sendMainCategoryMenu(phone);
};

// ── Handle Brand Selection ────────────────────────────────────────
const handleBrandSelection = async (phone, brandId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.selectedBrand = brandId;

  // Roofing Sheets → ask Sheet Type after brand
  if (lead.productType === 'roofing_sheets') {
    lead.quoteStep = 'sheet_type';
    await lead.save();
    await sendSheetTypeMenu(phone);
    return;
  }

  lead.quoteStep = 'thickness';
  await lead.save();

  const result = await sendThicknessMenu(phone, lead.productType);

  // Cement has no thickness → go straight to pincode
  if (result === 'skip_thickness') {
    lead.quoteStep = 'pincode';
    await lead.save();
    await sendText(phone, '📍 Enter your *Delivery PINCODE*:\n(6-digit pincode)');
  }
};

// ── Handle Sheet Type Selection (only for roofing_sheets) ─────────
const handleSheetTypeSelection = async (phone, sheetTypeId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.selectedSheetType = sheetTypeId;
  lead.quoteStep         = 'thickness';
  await lead.save();

  await sendThicknessMenu(phone, 'roofing_sheets');
};

// ── Handle Thickness Selection ────────────────────────────────────
const handleThicknessSelection = async (phone, thicknessId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.selectedThickness = thicknessId;
  lead.quoteStep         = 'pincode';
  await lead.save();

  await sendText(phone, '📍 Enter your *Delivery PINCODE*:\n(6-digit pincode)');
};

// ── Handle Pincode ────────────────────────────────────────────────
const handlePincode = async (phone, pincode) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  pincode = pincode.trim();

  if (!/^\d{6}$/.test(pincode)) {
    await sendText(phone, '⚠️ Please enter a valid *6-digit pincode* (e.g., 624001)');
    return;
  }

  if (!VALID_PINCODES.includes(pincode)) {
    await sendText(phone,
      `❌ *Sorry!* We currently don't deliver to pincode *${pincode}*.\n\n` +
      `We serve:\n` +
      VALID_PINCODES.map(p => `• ${p}`).join('\n') +
      `\n\nPlease enter a valid pincode.`
    );
    return;
  }

  lead.deliveryPincode = pincode;
  lead.currentStage    = 'completed';
  lead.quoteStep       = 'done';
  await lead.save();

  await sendQuoteSummary(phone, lead);
};

// ── Quote Summary ─────────────────────────────────────────────────
const sendQuoteSummary = async (phone, lead) => {
  const product   = PRODUCTS[lead.productType];
  const brandName = product?.brands.find(b => b.id === lead.selectedBrand)?.title || '-';
  const sizeName  = product?.thickness.find(t => t.id === lead.selectedThickness)?.title || '-';

  // Sheet type (only for roofing_sheets)
  let sheetTypeLine = '';
  if (lead.productType === 'roofing_sheets' && lead.selectedSheetType) {
    const sheetType = product?.sheetTypes?.find(s => s.id === lead.selectedSheetType)?.title || '-';
    sheetTypeLine = `• Sheet Type: ${sheetType}\n`;
  }

  const summary = `
✅ *Thank you! Your quote request has been received.*

📋 *Quote Summary:*
• Product   : ${product?.title || lead.productType}
• Brand     : ${brandName}
${sheetTypeLine}• Size      : ${sizeName}
• Pincode   : ${lead.deliveryPincode}

Our team will call you within *2 business hours*. 🤝
  `.trim();

  await sendText(phone, summary);
};

// ── Main Handler ──────────────────────────────────────────────────
const handleQuoteFormAnswer = async (phone, answer, isInteractive = false) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  const step = lead.quoteStep;

  if (step === 'brand' && isInteractive) {
    await handleBrandSelection(phone, answer);
  } else if (step === 'sheet_type' && isInteractive) {
    await handleSheetTypeSelection(phone, answer);
  } else if (step === 'thickness' && isInteractive) {
    await handleThicknessSelection(phone, answer);
  } else if (step === 'pincode' && !isInteractive) {
    await handlePincode(phone, answer);
  }
};

module.exports = { handleQuoteFormAnswer, sendQuoteSummary };
