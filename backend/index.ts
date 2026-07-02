import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

import authRouter from './routes/auth';
import adsRouter from './routes/ads';
import webhooksRouter from './routes/webhooks';
import path from 'path';

import publishersRouter from './routes/publishers';
import { startCronJobs } from './cron';

// Note: webhook routes must parse raw body.
// So we use standard express.json() for everything EXCEPT the stripe webhook.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/ads', adsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/publishers', publishersRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/widget', express.static(path.join(__dirname, '../widget')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`TownTicker Backend running on port ${port}`);
  startCronJobs();
});
