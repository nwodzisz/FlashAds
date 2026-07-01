import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

import adsRouter from './routes/ads';
import webhooksRouter from './routes/webhooks';
import path from 'path';

// Note: webhook routes must parse raw body.
// So we use standard express.json() for everything EXCEPT the stripe webhook.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/api/ads', adsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`FlashAds Backend running on port ${port}`);
});
