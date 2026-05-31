require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const webhookRouter = require('./routes/webhook');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/webhook', webhookRouter);

app.get('/', (_req, res) =>
  res.send('Shree SivaBalaaji Steels WhatsApp Bot is running!')
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log('Server running on port ' + PORT)
);
