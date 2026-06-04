require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const webhookRouter = require('./routes/webhook');
const leadsRouter = require('./routes/leads');
const app = express();

app.use(cors({origin: 'https://whatsapp-ai-chatbot-sigma.vercel.app/'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/webhook', webhookRouter);
app.use('/api/leads', leadsRouter);

app.get('/', (_req, res) =>
  res.send('Shree SivaBalaaji Steels WhatsApp Bot is running!')
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
});

