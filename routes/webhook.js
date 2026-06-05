const express = require('express');
const router  = express.Router();

const Lead = require('../models/lead');
const { handleGreeting } = require('../handlers/stage1');
const {
  sendMainCategoryMenu,
  sendSubCategoryMenu,
  handleMainCategorySelection,
  handleSubCategorySelection,
  handleUseCaseItemSelection,
  APPLICATION_INFO,

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

    // ── AI ORDER CONFIRM ──────────────────────────────────────────────
if (lead.currentStage === 'ai_order_confirm') {
  if (msgType !== 'interactive') return;
  const buttonId = message.interactive?.button_reply?.id;
  if (!buttonId) return;

  if (buttonId === 'ai_order_yes') {
    lead.aiOrderStep  = 'brand';  // product step skip — already known
  lead.currentStage = 'ai_order_flow';
  await lead.save();

  // Product-க்கு available brands காட்டு
  const productBrands = {
    'roofing sheets': 'JSW Everglow, JSW Colouron+, JSW Pragati+, JSW Silveron+, JSW Vishwas+, JSW ColorVista',
    'roofing accessories': 'JSW L Corner, Gutter, Ridge, L Flashing, Down Pipe, Barge Cap',
    'fibre cement boards': 'Everest Standard Board, Everest HD Board',
    'tmt bars': 'ARS550D',
    'steel pipes': 'MS Pipes, GP Pipes',
    'cement': 'Dalmia Cement',
    'fasteners': 'TATA Screws, Louvers, Roof Ventilators, Thoovanam, Mugappu',
  };

  const productKey = lead.aiOrderProduct?.toLowerCase();
  let brandList = null;
  for (const key in productBrands) {
    if (productKey?.includes(key)) {
      brandList = productBrands[key];
      break;
    }
  }

  const brandMsg = brandList
    ? `Available brands:\n${brandList}\n\nWhich brand would you like?`
    : `Which brand would you like?`;

  await sendText(phone, brandMsg);
}
}

// ── AI ORDER FLOW ─────────────────────────────────────────────────
if (lead.currentStage === 'ai_order_flow') {
  if (msgType === 'text') {
    const text = message.text?.body?.trim();
    if (text) await handleAIMessage(phone, text, lead.messages);
  }
  return;
}
    


 
    // ── USE CASE ACTION ───────────────────────────────────────────
    if (lead.currentStage === 'use_case_action') {
      if (msgType !== 'interactive') return;
      const buttonId = message.interactive?.button_reply?.id;
      if (!buttonId) return;

      if (buttonId === 'uc_view_products') {
        lead.currentStage = 'main_category';
        await lead.save();
        await sendMainCategoryMenu(phone);
      }  else if (buttonId === 'uc_no_thanks') {
        await sendText(phone, 'Thank you! 🙏 Feel free to reach us anytime.');
        lead.currentStage = 'completed';
        await lead.save();
        }
      return;
    }

    // ── QUOTE FORM ────────────────────────────────────────────────
   if (lead.currentStage === 'quote_form') {
  if (msgType === 'interactive') {
  const listId = message.interactive?.list_reply?.id;
  if (listId) {
    if (APPLICATION_INFO[listId]) {
      await handleUseCaseItemSelection(phone, listId);
    } else {
      await handleQuoteFormAnswer(phone, listId, true);
    }
  }
} else if (msgType === 'text') {
    const text = message.text?.body?.trim();
    if (!text) return;
    // pincode step-ல மட்டும் handleQuoteFormAnswer
      if (['pincode', 'customer_name'].includes(lead.quoteStep)) {
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
    // if (lead.currentStage === 'tracking') {
    //   if (msgType === 'text') {
    //     const orderId = message.text?.body?.trim();
    //     await sendText(phone, '⚠️ *Coming Soon!*\nThis item is currently not available, we will update soon. Please explore our other products!');
      
    //   }
    //   return;
    // }

    
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