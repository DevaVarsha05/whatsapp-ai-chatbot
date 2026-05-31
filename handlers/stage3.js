const Lead = require('../models/lead');
const { sendDropdown, sendText } = require('../utils/whatsapp');

// ── Valid Delivery Pincodes ───────────────────────────────────────
// TODO: Replace with your actual 5 pincodes
const VALID_PINCODES = [
  '624001',
  '624002',
  '624003',
  '624004',
  '624005',
];

// ── Form step definitions ─────────────────────────────────────────
const FORM_STEPS = [
  {
    key: 'steelGrade',
    label: 'Steel Grade',
    options: [
      { id: 'Fe500',  label: 'Fe500' },
      { id: 'Fe500D', label: 'Fe500D' },
      { id: 'Fe550',  label: 'Fe550' },
      { id: 'Fe550D', label: 'Fe550D' },
    ],
  },
  {
    key: 'diameter',
    label: 'Diameter / Thickness',
    options: [
      { id: '8mm',  label: '8mm' },
      { id: '10mm', label: '10mm' },
      { id: '12mm', label: '12mm' },
      { id: '16mm', label: '16mm' },
      { id: '20mm', label: '20mm' },
      { id: '25mm', label: '25mm' },
      { id: '32mm', label: '32mm' },
    ],
  },
  {
    key: 'brandPreference',
    label: 'Brand Preference',
    options: [
      { id: 'primary_brand', label: 'Primary (Tata / JSW)' },
      { id: 'secondary_brand', label: 'Secondary Brand' },
      { id: 'no_preference', label: 'No Preference' },
    ],
  },
  {
    key: 'deliveryTimeline',
    label: 'Delivery Timeline',
    options: [
      { id: 'Immediate (1-3 days)', label: 'Immediate (1-3 days)' },
      { id: 'This Week',            label: 'This Week' },
      { id: 'Next Month',           label: 'Next Month' },
      { id: 'Just Inquiring',       label: 'Just Inquiring' },
    ],
  },
  {
    key: 'projectType',
    label: 'Project Type',
    options: [
      { id: 'Residential',    label: 'Residential' },
      { id: 'Commercial',     label: 'Commercial' },
      { id: 'Infrastructure', label: 'Infrastructure' },
      { id: 'Dealership',     label: 'Dealership' },
    ],
  },
];

// Full ordered flow
const ALL_STEPS = [
  { type: 'dropdown', key: 'steelGrade' },
  { type: 'dropdown', key: 'diameter' },
  { type: 'text',     key: 'quantity',        prompt: '📦 Enter the *required quantity* in Tonnes:\n(e.g., 25)' },
  { type: 'dropdown', key: 'brandPreference' },
  { type: 'text',     key: 'deliveryPincode', prompt: '📍 Enter your *Delivery PINCODE*:\n(6-digit pincode)' },
  { type: 'text',     key: 'siteCity',        prompt: '🏙️ Enter your *Site Location / City*:\n(e.g., Dindigul)' },
  { type: 'dropdown', key: 'deliveryTimeline' },
  { type: 'text',     key: 'contactPerson',   prompt: '👤 Enter *Full Name / Contact Person*:' },
  { type: 'text',     key: 'companyName',     prompt: '🏢 Enter your *Company / Project Name*:' },
  { type: 'dropdown', key: 'projectType' },
];

const sendCurrentStep = async (phone, stepIndex) => {
  const step = ALL_STEPS[stepIndex];
  if (!step) return;

  if (step.type === 'dropdown') {
    const def = FORM_STEPS.find((f) => f.key === step.key);
    await sendDropdown(phone, def.label, def.options);
  } else {
    await sendText(phone, step.prompt);
  }
};

// ── Start Stage 3 ─────────────────────────────────────────────────
const startQuoteForm = async (phone) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.quoteFormStep = 0;
  lead.currentStage  = 'quote_form';
  await lead.save();

  await sendText(phone,
    `Great choice! 📋 Let's get your *Quote* ready.\nI'll ask you a few quick questions.`
  );
  await sendCurrentStep(phone, 0);
};

// ── Handle each answer ────────────────────────────────────────────
const handleQuoteFormAnswer = async (phone, answer) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  const stepIndex = lead.quoteFormStep || 0;
  const step      = ALL_STEPS[stepIndex];
  if (!step) return;

  // ── Validate each field ───────────────────────────────────────
  if (step.key === 'quantity') {
    const num = parseFloat(answer);
    if (isNaN(num)) {
      await sendText(phone, '⚠️ Please enter a valid number for quantity (e.g., 25)');
      return;
    }
    lead.quantity = num;

  } else if (step.key === 'deliveryPincode') {
    // ── Pincode Validation ──────────────────────────────────────
    const pincode = answer.trim();

    if (!/^\d{6}$/.test(pincode)) {
      await sendText(phone, '⚠️ Please enter a valid *6-digit pincode* (e.g., 624001)');
      return;
    }

    if (!VALID_PINCODES.includes(pincode)) {
      await sendText(phone,
        `❌ *Sorry!* We currently don't deliver to pincode *${pincode}*.\n\n` +
        `We serve the following areas:\n` +
        VALID_PINCODES.map(p => `• ${p}`).join('\n') +
        `\n\nPlease enter a pincode from the above list, or type *menu* to go back.`
      );
      return; // Don't advance — ask again
    }

    lead.deliveryPincode = pincode;

  } else {
    lead[step.key] = answer;
  }

  const nextStep = stepIndex + 1;
  lead.quoteFormStep = nextStep;
  await lead.save();

  if (nextStep < ALL_STEPS.length) {
    await sendCurrentStep(phone, nextStep);
  } else {
    lead.currentStage = 'completed';
    await lead.save();
    await sendQuoteSummary(phone, lead);
  }
};

// ── Final summary ─────────────────────────────────────────────────
const sendQuoteSummary = async (phone, lead) => {
  const summary = `
✅ *Thank you! Your quote request has been received.*

📋 *Quote Summary:*
• Steel Grade : ${lead.steelGrade}
• Diameter    : ${lead.diameter}
• Quantity    : ${lead.quantity} Tonnes
• Brand       : ${lead.brandPreference}
• Pincode     : ${lead.deliveryPincode}
• City        : ${lead.siteCity}
• Timeline    : ${lead.deliveryTimeline}
• Contact     : ${lead.contactPerson}
• Company     : ${lead.companyName}
• Project     : ${lead.projectType}

Our team will call you within *2 business hours*. 🤝
  `.trim();

  await sendText(phone, summary);
};

module.exports = { startQuoteForm, handleQuoteFormAnswer };

