import { Router } from 'express';
import { stripe } from '../stripe';
import { query } from '../db';
import express from 'express';

const router = Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Use express.raw() for the webhook route
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const adId = session.client_reference_id;
    const paymentIntentId = session.payment_intent;

    if (adId) {
      // Fetch duration to calculate end time
      const adResult = await query('SELECT duration_hours FROM ads WHERE id = $1', [adId]);
      if (adResult.rowCount && adResult.rowCount > 0) {
        const durationHours = adResult.rows[0].duration_hours;
        
        await query(`
          UPDATE ads 
          SET status = 'active', 
              stripe_payment_intent_id = $1,
              start_time = NOW(),
              end_time = NOW() + INTERVAL '1 hour' * $2
          WHERE id = $3
        `, [paymentIntentId, durationHours, adId]);
      }
    }
  }

  res.status(200).end();
});

export default router;
