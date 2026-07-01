import { Router } from 'express';
import { query } from '../db';
import { stripe } from '../stripe';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for local file storage mock
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Generate a simple unique id using timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Widget endpoint: Get up to 3 random active ads for a publisher
router.get('/', async (req, res) => {
  try {
    const publisherId = req.query.publisher as string;
    if (!publisherId) {
      return res.status(400).json({ error: 'Missing publisher ID' });
    }

    const { rows } = await query(`
      SELECT id, headline, body_text, link_url, image_url 
      FROM ads 
      WHERE publisher_id = $1 
        AND status = 'active'
        AND start_time <= NOW() 
        AND end_time >= NOW()
      ORDER BY RANDOM() 
      LIMIT 3;
    `, [publisherId]);

    res.json({ ads: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advertiser checkout
router.post('/checkout', upload.single('image'), async (req, res) => {
  try {
    const { publisher_id, headline, body_text, link_url, tier } = req.body;
    
    // Tier logic
    let duration_hours = 24;
    let price_cents = 2500;
    
    if (tier === '3-day') {
      duration_hours = 72;
      price_cents = 6000;
    } else if (tier === '7-day') {
      duration_hours = 168;
      price_cents = 12000;
    } else if (tier !== '1-day') {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : '';

    // Calculate platform fee (20%)
    const platform_fee_cents = Math.round(price_cents * 0.20);

    // Fetch publisher's stripe account id
    const pubResult = await query('SELECT stripe_account_id FROM publishers WHERE id = $1', [publisher_id]);
    if (pubResult.rowCount === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }
    const publisher = pubResult.rows[0];

    if (!publisher.stripe_account_id) {
        return res.status(400).json({ error: 'Publisher has not onboarded with Stripe' });
    }

    // Insert pending ad
    const adResult = await query(`
      INSERT INTO ads (publisher_id, headline, body_text, link_url, image_url, tier, duration_hours, price_cents)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `, [publisher_id, headline, body_text, link_url, image_url, tier, duration_hours, price_cents]);
    
    const adId = adResult.rows[0].id;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Flash Ad (${tier}) - ${headline}`,
          },
          unit_amount: price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: platform_fee_cents,
        transfer_data: {
          destination: publisher.stripe_account_id,
        },
      },
      client_reference_id: adId,
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    // Update ad with session id
    await query('UPDATE ads SET stripe_checkout_session_id = $1 WHERE id = $2', [session.id, adId]);

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
