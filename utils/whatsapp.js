const axios = require('axios');

const BASE_URL = `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`;

const headers = () => ({
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  'Content-Type': 'application/json',
});

// ── Plain text message ────────────────────────────────────────────
const sendText = async (to, body) => {
  await axios.post(BASE_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  }, { headers: headers() });
};

// ── Interactive Buttons (max 3) ───────────────────────────────────
// buttons: [{ id: 'btn_id', title: 'Label' }, ...]
const sendButtons = async (to, bodyText, buttons) => {
  await axios.post(BASE_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  }, { headers: headers() });
};

// ── List Menu (dropdown) ──────────────────────────────────────────
// sections: [{ title: 'Section Title', rows: [{ id, title, description }] }]
const sendListMenu = async (to, bodyText, buttonLabel, sections) => {
  await axios.post(BASE_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections,
      },
    },
  }, { headers: headers() });
};

// ── Single-section dropdown helper (used in Stage 3) ─────────────
// options: [{ id, label }]
const sendDropdown = async (to, questionLabel, options) => {
  await sendListMenu(
    to,
    `Please select your *${questionLabel}*:`,
    `Choose ${questionLabel}`,
    [{
      title: questionLabel,
      rows: options.map((o) => ({ id: o.id, title: o.label })),
    }]
  );
};


module.exports = { sendText, sendButtons, sendListMenu, sendDropdown };
