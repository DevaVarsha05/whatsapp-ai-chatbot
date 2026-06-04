const express = require('express');
const router  = express.Router();

const Lead = require('../models/lead');
const { handleGreeting } = require('../handlers/stage1');
const {
  sendMainCategoryMenu,
  sendSubCategoryMenu,
  handleMainCategorySelection,
  handleSubCategorySelection,


} = require('../handlers/stage2');
const { handleQuoteFormAnswer } = require('../handlers/stage3');
const {
  sendCatalogMenu,
  handleCatalogProductSelect,
  handleCatalogAction,
  handleCatalogFormAnswer,
} = require('../handlers/stagecatalogtemp');
const { sendText }        = require('../utils/whatsapp');
const { handleAIMessage } = require('../handlers/aiassisatnt');

// ── GET: Webhook Verification ─────────────────────────────────────
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

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
    console.log(`📌 Current stage: ${lead?.currentStage}`);
    const isGreetWord =
      msgType === 'text' &&
      ['hi', 'hello', 'hey', 'menu', 'start',
       'shiva', 'shiva steel', 'sivabalaaji', 'siva', 'steel'].includes(
        message.text?.body?.trim().toLowerCase()
      );

    // ── New or Greet → direct to main category ────────────────────
    if (!lead || isGreetWord) {
      await handleGreeting(phone, name);
      return;
    }

    // ── MAIN CATEGORY ─────────────────────────────────────────────
    if (lead.currentStage === 'main_category') {
  if (msgType !== 'interactive') {
    const text = message.text?.body?.trim();
    if (text) {
      lead.messages.push({ role: 'user', content: text });
      const aiReply = await handleAIMessage(phone, text, lead.messages);
      if (aiReply) lead.messages.push(aiReply);
      await lead.save();
    }
    return;
  }
  const listId = message.interactive?.list_reply?.id;
  if (!listId) return;
  await handleMainCategorySelection(phone, listId);
  return;
}

    // ── SUB CATEGORY ──────────────────────────────────────────────
    if (lead.currentStage === 'sub_category') {
      if (msgType !== 'interactive') {
        await sendSubCategoryMenu(phone, lead.mainCategory);
        return;
      }
      const listId = message.interactive?.list_reply?.id;
     
      if (!listId) return;
      await handleSubCategorySelection(phone, listId);
      return;
    }

  if (lead.currentStage === 'quote_form') {
      
      // >>> DIRECT AH INTHA CHINNA CONDITION MATTUM SET PANNUNGA <<<
      if (lead.productType && (lead.productType.includes('uc_') || lead.productType.includes('residential'))) {
        await sendText(phone, '⚠️ *Coming Soon!*\nThis item is currently not available, we will update soon. Please explore our other products!');
        
        lead.currentStage = 'main_category';
        lead.quoteStep    = '';
        await lead.save();

        await sendMainCategoryMenu(phone);
        return;
      }

    }
    // ── USE CASE ACTION ───────────────────────────────────────────
    if (lead.currentStage === 'use_case_action') {
      if (msgType !== 'interactive') return;
      const buttonId = message.interactive?.button_reply?.id;
      if (!buttonId) return;

      if (buttonId === 'quote_request') {
        lead.currentStage = 'main_category';
        await lead.save();
        await sendMainCategoryMenu(phone);
      } else if (buttonId === 'main_menu') {
        lead.currentStage = 'main_category';
        await lead.save();
        await sendMainCategoryMenu(phone);
      }
      return;
    }

    // ── QUOTE FORM ────────────────────────────────────────────────
   if (lead.currentStage === 'quote_form') {
  if (msgType === 'interactive') {
    const listId = message.interactive?.list_reply?.id;
    if (listId) await handleQuoteFormAnswer(phone, listId, true);
  } else if (msgType === 'text') {
    const text = message.text?.body?.trim();
    if (!text) return;
    // pincode step-ல மட்டும் handleQuoteFormAnswer
    if (lead.quoteStep === 'pincode') {
      await handleQuoteFormAnswer(phone, text, false);
    } else {
      // மற்ற text-க்கு AI reply
      lead.messages.push({ role: 'user', content: text });
      const aiReply = await handleAIMessage(phone, text, lead.messages);
      if (aiReply) lead.messages.push(aiReply);
      await lead.save();
    }
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

    // ── TRACKING ──────────────────────────────────────────────────
    if (lead.currentStage === 'tracking') {
      if (msgType === 'text') {
        const orderId = message.text?.body?.trim();
        await sendText(phone, '⚠️ *Coming Soon!*\nThis item is currently not available, we will update soon. Please explore our other products!');
      
      }
      return;
    }

    
    // ── COMPLETED ─────────────────────────────────────────────────
    if (lead.currentStage === 'completed') {
      if (msgType === 'text' && message.text?.body?.trim().toLowerCase() === 'yes') {
        lead.currentStage = 'main_category';
        await lead.save();
        await sendMainCategoryMenu(phone);
      } else {
        await sendText(phone,
          `Hello ${name}! 👋 Your quote is already submitted.\nWould you like to request another? Reply *Yes* to start again.`
        );
      }
      return;
    }

    // ── AI ASSISTANT: unhandled text ──────────────────────────────
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
    console.error('❌ Error details:', err.response?.data);
  }

  
});

module.exports = router;