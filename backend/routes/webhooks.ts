import { Router } from 'express';
import { stripe } from '../stripe';
import { query } from '../db';
import express from 'express';

const router = Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Use express.raw() for the webhook route
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
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
      const adResult = await query('SELECT duration_hours, advertiser_email, publisher_id, start_time FROM ads WHERE id = $1', [adId]);
      if (adResult.rowCount && adResult.rowCount > 0) {
        const { duration_hours, advertiser_email, publisher_id, start_time } = adResult.rows[0];

        await query(`
          UPDATE ads 
          SET status = 'active', 
              stripe_payment_intent_id = $1,
              start_time = COALESCE(start_time, NOW()),
              end_time = COALESCE(start_time, NOW()) + INTERVAL '1 hour' * ($2::integer)
          WHERE id = $3
        `, [paymentIntentId, duration_hours, adId]);

        // WHALE DETECTION
        if (advertiser_email) {
          const spendResult = await query(`
            SELECT SUM(price_cents) as total_spend
            FROM ads
            WHERE advertiser_email = $1
              AND publisher_id = $2
              AND status = 'active'
              AND start_time >= NOW() - INTERVAL '30 days'
          `, [advertiser_email, publisher_id]);

          const totalSpend = parseInt(spendResult.rows[0].total_spend || '0', 10);
          if (totalSpend >= 50000) { // $500 in cents
            console.log(`\n======================================================`);
            console.log(`🐳 WHALE ALERT!`);
            console.log(`Advertiser ${advertiser_email} has spent over $500 in the last 30 days!`);
            console.log(`Sending automated email to publisher's Ad Sales Director...`);
            console.log(`"Heads up: ${advertiser_email} has spent $${(totalSpend / 100).toFixed(2)} on flash ads this month. They clearly have budget and see value in your audience. You should call them directly and pitch the premium banner package."`);
            console.log(`======================================================\n`);
          }
        }
      }
    }
  }

  res.status(200).end();
});

export default router;
