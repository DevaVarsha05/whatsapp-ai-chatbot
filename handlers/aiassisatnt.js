const { sendText, sendButtons } = require('../utils/whatsapp');
const Lead  = require('../models/lead');
const Order = require('../models/order');


const SYSTEM_PROMPT = `You are a sales assistant for Shree SivaBalaaji Steels, a building materials store in Tamil Nadu.

RULES — follow strictly, no exceptions:

1. PRODUCT AVAILABLE → confirm it and mention the types/sizes available. Keep it short.

2. PRODUCT NOT AVAILABLE → say exactly: "Sorry, that product is not available with us."
   Do NOT say "type hi" or suggest anything else.

3. PRICE question → say: "For pricing, please contact us directly:
   📞 XXXXXXXXXX
   We'll give you the best rate!"

4. UNRELATED question (weather, news, general chat, anything not about our products or company) → say exactly: "I can only help with questions about our products. For anything else, please contact us at 📞 XXXXXXXXXX"
5. Never repeat the customer's question. Answer directly only.
6. Keep replies under 4 lines.
7. Reply only in English language.
8. If the customer asks about a product we have, always end your reply with exactly: "PRODUCT_MATCH"


PRODUCT CATALOG :

ROOFING PRODUCTS:
- Roofing Sheets (JSW brands): Everglow, Colouron+, Pragati+, Silveron+, Vishwas+, ColorVista
  Sheet Types: Profile Sheet, Crimp Sheet, Arch Sheet, Profile Ridge Sheet, Plain Sheet
  Thickness: 0.35mm, 0.40mm, 0.45mm, 0.47mm, 0.50mm, 0.60mm

- Roofing Accessories (JSW): L Corner, Gutter, Ridge, L Flashing, Down Pipe, Barge Cap
  Thickness: 0.35mm to 0.60mm

- Fibre Cement Boards (Everest): Standard Board, HD Board
  Thickness: 6mm, 8mm, 10mm

STRUCTURAL & FASTENING:
- TMT Bars: ARS550D | Sizes: 8mm, 10mm, 12mm, 16mm, 20mm
- Steel Pipes: MS Pipes, GP Pipes | Thickness: 1mm, 1.2mm, 1.6mm, 2mm, 2.5mm, 3mm, 4mm
- Cement: Dalmia Cement
- Fasteners & Fittings:
  TATA Screws: 19mm, 25mm, 55mm
  Louvers, Roof Ventilators, Mugappu
  Thoovanam: 6 inch, 8 inch

USE CASES:
- Residential: House Terraces, Balcony, Frontage
- Commercial: Shop Extensions, Transit Shelters, Security Cabins, Walkways
- Industrial: Car Parking, Cattle Shed, Poultry Farms, Godown`;

const handleAIOrderFlow = async (phone, userMessage, lead) => {
  const step = lead.aiOrderStep;

  if (step === 'product') {
    lead.aiOrderProduct = userMessage;
    lead.aiOrderStep    = 'brand';
    await lead.save();
    await sendText(phone, `Which brand would you like?\n(Type the brand name)`);
    return;
  }

  if (step === 'brand') {
    lead.aiOrderBrand = userMessage;
    lead.aiOrderStep  = 'size';
    await lead.save();
    await sendText(phone, `Which size/thickness do you need?\n(Type the size)`);
    return;
  }

  if (step === 'brand') {
  const validBrands = [
    'jsw everglow', 'jsw colouron', 'jsw pragati', 'jsw silveron',
    'jsw vishwas', 'jsw colorvista', 'l corner', 'gutter', 'ridge',
    'l flashing', 'down pipe', 'barge cap', 'everest standard',
    'everest hd', 'ars550d', 'ms pipes', 'gp pipes', 'dalmia',
    'tata screws', 'louvers', 'roof ventilators', 'thoovanam', 'mugappu'
  ];
  if (step === 'size') {
  const sizeGuide = {
    'roofing': '0.35mm, 0.40mm, 0.45mm, 0.47mm, 0.50mm, 0.60mm',
    'fibre': '6mm, 8mm, 10mm',
    'tmt': '8mm, 10mm, 12mm, 16mm, 20mm',
    'pipe': '1mm, 1.2mm, 1.6mm, 2mm, 2.5mm, 3mm, 4mm',
    'screw': '19mm, 25mm, 55mm',
    'thoovanam': '6 inch, 8 inch',
  };

  const productKey = lead.aiOrderProduct?.toLowerCase();
  let availableSizes = null;
  for (const key in sizeGuide) {
    if (productKey?.includes(key)) {
      availableSizes = sizeGuide[key];
      break;
    }
  }

  // User "which size" மாதிரி கேட்டா — sizes காட்டு
  const askingForSizes = ['which size', 'what size', 'available size', 'sizes available']
    .some(q => userMessage.toLowerCase().includes(q));

  if (askingForSizes) {
    const msg = availableSizes
      ? `Available sizes: ${availableSizes}\n\nWhich size would you like?`
      : `Please type your required size:`;
    await sendText(phone, msg);
    return;
  }

  lead.aiOrderSize = userMessage;
  lead.aiOrderStep = 'pincode';
  await lead.save();
  await sendText(phone, `📍 Enter your delivery *Pincode*:`);
  return;
}
  

  
}

  const input = userMessage.toLowerCase();
  const isValid = validBrands.some(b => input.includes(b));

  if (!isValid) {
    await sendText(phone, `⚠️ Please select a valid brand from the list above.`);
    return;
  }

 

  if (step === 'pincode') {
    lead.aiOrderPincode = userMessage;
    lead.aiOrderStep    = 'name';
    await lead.save();
    await sendText(phone, `👤 Your *Name* please:`);
    return;
  }

  if (step === 'name') {
    lead.aiOrderName  = userMessage;
    lead.aiOrderStep  = null;
    lead.currentStage = 'main_category';
    await lead.save();

    // Save Order
    await Order.create({
      phone,
      name:    userMessage,
      product: lead.aiOrderProduct,
      brand:   lead.aiOrderBrand,
      size:    lead.aiOrderSize,
      pincode: lead.aiOrderPincode,
      source:  'text',
    });

    // Send Summary
    const summary = `✅ *Order Request Received!*

📋 *Summary:*
- Name    : ${userMessage}
- Product : ${lead.aiOrderProduct}
- Brand   : ${lead.aiOrderBrand}
- Size    : ${lead.aiOrderSize}
- Pincode : ${lead.aiOrderPincode}

Our team will contact you within *2 business hours*. 🤝`;

    await sendText(phone, summary);
    return;
  }
};


const handleAIMessage = async (phone, userMessage, conversationHistory = []) => {
  try {
    
    const lead = await Lead.findOne({ phone });

    // If in AI order flow
    if (lead?.aiOrderStep) {
      await handleAIOrderFlow(phone, userMessage, lead);
      return;
    }
    
    
    const messages = [
      ...conversationHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
       method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Free & Fast!
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });
     const data = await response.json();
    console.log('🤖 Groq Response:', JSON.stringify(data));

    let reply = data?.choices?.[0]?.message?.content;
    if (!reply) return;

    // Check if product match
    const isProductMatch = reply.includes('PRODUCT_MATCH');
    reply = reply.replace('PRODUCT_MATCH', '').trim();

    await sendText(phone, reply);

    // If product match → ask to order
    if (isProductMatch && lead) {
      await sendButtons(
        phone,
        'Would you like to place an order?',
        [
          { id: 'ai_order_yes', title: 'Yes, Order' },
          { id: 'ai_order_no',  title: 'No Thanks' },
        ]
      );
      lead.currentStage = 'ai_order_confirm';
      await lead.save();
    }

    return { role: 'assistant', content: reply };

  }catch (err) {
    console.error('❌ AI Assistant error:', err.message);
    await sendText(phone, 'Sorry, something went wrong. Type *hi* to start again!');
  }
};
module.exports = { handleAIMessage };