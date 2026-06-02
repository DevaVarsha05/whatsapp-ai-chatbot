const express = require('express');
const router  = express.Router();
 
const Lead = require('../models/lead');
const { handleGreeting, handleIntentSelection } = require('../handlers/stage1');
const { sendProductMenu, handleProductSelection } = require('../handlers/stage2');
const { startQuoteForm, handleQuoteFormAnswer }   = require('../handlers/stage3');
const {
  sendCatalogMenu,
  handleCatalogProductSelect,
  handleCatalogAction,
  handleCatalogFormAnswer,
} = require('../handlers/stagecatalogtemp');
const { sendText } = require('../utils/whatsapp');
const { handleAIMessage } = require('../handlers/aiassisatnt');
// ── GET: Webhook Verification ─────────────────────────────────────
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
 
  console.log('Mode:', mode);
  console.log('Received token:', token);
  console.log('Expected token:', process.env.VERIFY_TOKEN);
 
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});
 
// ── POST: Receive Messages ────────────────────────────────────────
router.post('/', async (req, res) => {
  res.sendStatus(200);
 
  try {
    const body = req.body;
    if (!body.object || !body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) return;
 
    const value   = body.entry[0].changes[0].value;
    const message = value.messages[0];
    const contact = value.contacts?.[0];
 
    const phone   = message.from;
    const name    = contact?.profile?.name || 'Customer';
    const msgType = message.type;
 
    console.log(`📨 Message from ${phone} (${name}): type=${msgType}`);
 
    let lead = await Lead.findOne({ phone });
 
    const isGreetWord =
      msgType === 'text' &&
      ['hi', 'hello', 'hey', 'menu', 'start'].includes(
        message.text?.body?.trim().toLowerCase()
      );
 
    // ── New or Greet ──────────────────────────────────────────────
    if (!lead || isGreetWord) {
      await handleGreeting(phone, name);
      return;
    }
 
    // ── STAGE 1: Greeting Buttons ─────────────────────────────────
    if (lead.currentStage === 'greeting') {
  // 1️⃣ பயனர் Text மெசேஜ் அனுப்பினால்
  if (msgType !== 'interactive') {
    const text = message.text?.body?.trim();
    if (text) {
      lead.messages.push({ role: 'user', content: text });
      const aiReply = await handleAIMessage(phone, text, lead.messages);
      if (aiReply) lead.messages.push(aiReply);
      await lead.save();
    }
    
    // ✅ உங்கள் பழைய handleGreeting இங்கேயும் வேலை செய்யும்
    await handleGreeting(phone, name);
    return;
  }

  // 2️⃣ பயனர் Button கிளிக் செய்தால்
  const buttonId = message.interactive?.button_reply?.id;
  if (!buttonId) return;

  // Button கிளிக் செய்த பிறகு எப்போதும் போல இயங்கும் கோட்...

 
      const result = await handleIntentSelection(phone, buttonId);
      if (result === 'go_to_stage2')  await sendProductMenu(phone);
      if (result === 'send_tracking') {
     lead = await Lead.findOne({ phone });
     lead.currentStage = 'tracking';
     await lead.save();
     await sendText(phone, '🚚 Please provide your Order ID to track.');
}
      if (result === 'send_catalog') {
        lead = await Lead.findOne({ phone });
        lead.currentStage = 'catalog_browse';
        await lead.save();
        await sendCatalogMenu(phone);
      }
      return;
    }
 
    // ── STAGE 2: Product Selection ────────────────────────────────
    if (lead.currentStage === 'product_routing') {
      if (msgType !== 'interactive') {
        await sendProductMenu(phone);
        return;
      }
      const listId = message.interactive?.list_reply?.id;
      if (!listId) return;
      await handleProductSelection(phone, listId);
      return;
    }
 
    // ── STAGE 3: Quote Form ───────────────────────────────────────
    if (lead.currentStage === 'quote_form') {
      if (msgType === 'interactive') {
        const listId = message.interactive?.list_reply?.id;
        if (listId) await handleQuoteFormAnswer(phone, listId, true);
      } else if (msgType === 'text') {
        const text = message.text?.body?.trim();
        if (text) await handleQuoteFormAnswer(phone, text, false);
      }
      return;
    }
 
    // ── CATALOG BROWSE ────────────────────────────────────────────
    if (lead.currentStage === 'catalog_browse') {
      if (msgType !== 'interactive') {
        await sendCatalogMenu(phone);
        return;
      }
      const listId = message.interactive?.list_reply?.id;
      if (listId) await handleCatalogProductSelect(phone, listId);
      return;
    }
 
    // ── CATALOG ACTION ────────────────────────────────────────────
    if (lead.currentStage === 'catalog_action') {
      if (msgType !== 'interactive') return;
      const buttonId = message.interactive?.button_reply?.id;
      if (buttonId) await handleCatalogAction(phone, buttonId);
      return;
    }
 
    // ── CATALOG FORM ──────────────────────────────────────────────
    if (lead.currentStage === 'catalog_form') {
      if (msgType === 'interactive') {
        const listId = message.interactive?.list_reply?.id;
        if (listId) await handleCatalogFormAnswer(phone, listId);
      } else if (msgType === 'text') {
        const text = message.text?.body?.trim();
        if (text) await handleCatalogFormAnswer(phone, text);
      }
      return;
    }
 
    // ── COMPLETED ─────────────────────────────────────────────────
    if (lead.currentStage === 'completed') {
      if (msgType === 'text' && message.text?.body?.trim().toLowerCase() === 'yes') {
        lead.currentStage    = 'greeting';
        lead.intent          = null;
        lead.productType     = null;
        lead.quoteStep       = null;
        lead.selectedBrand   = null;
        lead.selectedThickness = null;
        lead.deliveryPincode = null;
        lead.catalogFormStep = 0;
        lead.catalogProduct  = null;
        await lead.save();
        await handleGreeting(phone, name);
      } else {
        await sendText(phone,
          `Hello ${name}! 👋 Your quote is already submitted.\nWould you like to request another quote? Reply *Yes* to start again.`
        );
      }
  return;
    }

    // ── AI ASSISTANT: All other unhandled text ────────────────────
    if (msgType === 'text') {
      const text = message.text?.body?.trim();
      if (!text) return;

      lead.messages.push({ role: 'user', content: text });
      const aiReply = await handleAIMessage(phone, text, lead.messages);
      if (aiReply) lead.messages.push(aiReply);
      await lead.save();
      return;
    }

  } catch (err) {
    console.error('❌ Webhook error:', err.message);
  }
});

module.exports = router;