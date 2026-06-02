const { sendText } = require('../utils/whatsapp');

const SYSTEM_PROMPT = `You are a sales assistant for Shree SivaBalaaji Steels, a building materials store in Tamil Nadu.

RULES — follow strictly, no exceptions:

1. PRODUCT AVAILABLE → confirm it and mention the types/sizes available. Keep it short.

2. PRODUCT NOT AVAILABLE → say exactly: "Sorry, that product is not available with us."
   Do NOT say "type hi" or suggest anything else.

3. PRICE question → say: "For pricing, please contact us directly:
   📞 9876543210
   We'll give you the best rate!"

4. UNRELATED question (weather, news, general chat, anything not about our products or company) → say exactly: "I can only help with questions about our products. For anything else, please contact us at 📞 9876543210"

5. Never repeat the customer's question. Answer directly only.
6. Keep replies under 4 lines.
7. Reply in the same language the customer used (Tamil or English).

PRODUCT CATALOG:
- Roofing Sheets: JSW Everglow, Colouron+, Pragati+, Silveron+, Vishwas+, ColorVista | Thickness: 0.35mm to 0.60mm
- Sheet Types: Profile Sheet, Crimp Sheet, Arch Sheet, Profile Ridge Sheet, Plain Sheet
- Roofing Accessories: JSW L Corner, Gutter, Ridge, L Flashing, Down Pipe, Barge Cap
- TMT Bars: ARS550D | Sizes: 8mm, 10mm, 12mm, 16mm, 20mm
- Cement: Dalmia
- Steel Pipes: MS Pipes, GP Pipes | Thickness: 1mm to 4mm
- Fibre Cement Boards: Everest Standard Board, HD Board | Thickness: 6mm, 8mm, 10mm
- Accessories: TATA Screws (19mm,25mm,55mm), Louvers, Roof Ventilators, Thoovanam (6",8"), Mugappu`;

const handleAIMessage = async (phone, userMessage, conversationHistory = []) => {
  try {
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

    const reply = data?.choices?.[0]?.message?.content;

    if (reply) {
      await sendText(phone, reply);
      return { role: 'assistant', content: reply };
    }
  } catch (err) {
    console.error('❌ AI Assistant error:', err.message);
    await sendText(phone, 'Sorry, something went wrong. Type *hi* to start again!');
  }
};
module.exports = { handleAIMessage };