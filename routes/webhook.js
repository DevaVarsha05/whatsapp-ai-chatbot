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
} = require('../handlers/Stagecatalog.js');
const { sendText } = require('../utils/whatsapp');
 
// ── GET: Meta webhook verification ───────────────────────────────
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
 
// ── POST: Receive WhatsApp messages ──────────────────────────────
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
 
    if (!lead || isGreetWord) {
      await handleGreeting(phone, name);
      return;
    }
 
    // ── STAGE 1: greeting buttons ─────────────────────────────────
    if (lead.currentStage === 'greeting') {
      if (msgType !== 'interactive') {
        await handleGreeting(phone, name);
        return;
      }
      const buttonId = message.interactive?.button_reply?.id;
      if (!buttonId) return;
 
      const result = await handleIntentSelection(phone, buttonId);
      if (result === 'go_to_stage2')  await sendProductMenu(phone);
      if (result === 'send_tracking') await sendText(phone, '🚚 Please provide your Order ID to track.');
 
      if (result === 'send_catalog') {
        lead = await Lead.findOne({ phone });
        lead.currentStage = 'catalog_browse';
        await lead.save();
        await sendCatalogMenu(phone);
      }
      return;
    }
 
    // ── CATALOG BROWSE: product list selection ────────────────────
    if (lead.currentStage === 'catalog_browse') {
      if (msgType !== 'interactive') {
        await sendCatalogMenu(phone);
        return;
      }
      const listId = message.interactive?.list_reply?.id;
      if (listId) await handleCatalogProductSelect(phone, listId);
      return;
    }
 
    // ── CATALOG ACTION: quote/back/done buttons ───────────────────
    if (lead.currentStage === 'catalog_action') {
      if (msgType !== 'interactive') {
        await sendText(phone, 'Please tap one of the buttons above.');
        return;
      }
      const buttonId = message.interactive?.button_reply?.id;
      if (buttonId) await handleCatalogAction(phone, buttonId);
      return;
    }
 
    // ── CATALOG FORM: quote form answers ──────────────────────────
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
 
    // ── STAGE 2: product routing ──────────────────────────────────
    if (lead.currentStage === 'product_routing') {
      if (msgType !== 'interactive') {
        await sendProductMenu(phone);
        return;
      }
      const listId = message.interactive?.list_reply?.id;
      if (!listId) return;
      const result = await handleProductSelection(phone, listId);
      if (result === 'go_to_stage3') await startQuoteForm(phone);
      return;
    }
 
    // ── STAGE 3: quote form ───────────────────────────────────────
    if (lead.currentStage === 'quote_form') {
      if (msgType === 'interactive') {
        const listId = message.interactive?.list_reply?.id;
        if (listId) await handleQuoteFormAnswer(phone, listId);
      } else if (msgType === 'text') {
        const text = message.text?.body?.trim();
        if (text) await handleQuoteFormAnswer(phone, text);
      }
      return;
    }
 
    // ── COMPLETED ─────────────────────────────────────────────────
    if (lead.currentStage === 'completed') {
      if (msgType === 'text' && message.text?.body?.trim().toLowerCase() === 'yes') {
        lead.currentStage    = 'greeting';
        lead.intent          = null;
        lead.productType     = null;
        lead.quoteFormStep   = 0;
        lead.catalogFormStep = 0;
        lead.catalogProduct  = null;
        await lead.save();
        await handleGreeting(phone, name);
      } else {
        await sendText(phone,
          `Hello ${name}! 👋 Your quote is already submitted.\nWould you like to request another quote? Reply *Yes* to start again.`
        );
      }
    }
 
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
  }
});
 
module.exports = router;