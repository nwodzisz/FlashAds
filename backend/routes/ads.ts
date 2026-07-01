import { Router } from 'express';
import { query } from '../db';
import { stripe } from '../stripe';
import { calculatePlatformFee } from '../utils';
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

    const pubResult = await query('SELECT config FROM publishers WHERE id = $1', [publisherId]);
    const widgetConfig = pubResult.rows[0]?.config?.widgetConfig || {};

    const { rows } = await query(`
      SELECT id, data, tier 
      FROM ads 
      WHERE publisher_id = $1 
        AND status = 'active'
        AND start_time <= NOW() 
        AND end_time >= NOW()
      ORDER BY RANDOM() 
      LIMIT 3;
    `, [publisherId]);

    res.json({ ads: rows, config: widgetConfig });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advertiser checkout
// We accept any file uploads, and we will map them into the dynamic data payload
router.post('/checkout', upload.any(), async (req, res) => {
  try {
    const { publisher_id, tier, ...dynamicData } = req.body;
    
    // Fetch publisher config
    const pubResult = await query('SELECT stripe_account_id, config FROM publishers WHERE id = $1', [publisher_id]);
    if (pubResult.rowCount === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }
    const publisher = pubResult.rows[0];

    if (!publisher.stripe_account_id) {
        return res.status(400).json({ error: 'Publisher has not onboarded with Stripe' });
    }

    const config = publisher.config || {};
    const tiers = config.tiers || [];
    const adSchema = config.adSchema || [];

    const selectedTier = tiers.find((t: any) => t.id === tier);
    if (!selectedTier) {
      return res.status(400).json({ error: 'Invalid tier selected' });
    }

    const price_cents = selectedTier.price_cents;
    const duration_hours = selectedTier.duration_hours;
    const platform_fee_cents = calculatePlatformFee(price_cents);

    // Populate file uploads into dynamicData
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        dynamicData[file.fieldname] = `/uploads/${file.filename}`;
      });
    }

    // Basic validation against adSchema
    for (const field of adSchema) {
      if (field.required && !dynamicData[field.name]) {
         return res.status(400).json({ error: `Missing required field: ${field.label}` });
      }
    }

    if (price_cents === 0) {
      // Free ad: bypass Stripe and instantly activate
      await query(`
        INSERT INTO ads (publisher_id, data, tier, duration_hours, price_cents, status, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW() + interval '1 hour' * ($4::integer))
      `, [publisher_id, JSON.stringify(dynamicData), selectedTier.name, duration_hours, price_cents]);
      
      return res.json({ url: `http://localhost:5173/success` });
    }

    // Insert pending ad for paid tiers
    const adResult = await query(`
      INSERT INTO ads (publisher_id, data, tier, duration_hours, price_cents)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [publisher_id, JSON.stringify(dynamicData), selectedTier.name, duration_hours, price_cents]);
    
    const adId = adResult.rows[0].id;

    // We'll use the first text field in the schema for the product name, or fallback to 'TownTicker Ad'
    const titleField = adSchema.find((f: any) => f.type === 'text' || f.type === 'short-text' || f.type === 'long-text');
    const productName = titleField && dynamicData[titleField.name] ? dynamicData[titleField.name] : 'TownTicker Ad';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `TownTicker Ad (${selectedTier.name}) - ${productName}`,
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
