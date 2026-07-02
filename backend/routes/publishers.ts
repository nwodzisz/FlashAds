import { Router } from 'express';
import { query } from '../db';
import { stripe } from '../stripe';
import { requireAuth, requireAdmin } from './auth';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

// Set up storage for logo uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();

// Helper to check if user belongs to this publisher
const canAccessPublisher = (req: any, publisherId: string) => {
  return req.user.role === 'admin' || req.user.publisher_id === publisherId;
};

// Get publisher config (public, used by widget and advertiser portal)
router.get('/:id', async (req: any, res: any) => {
  try {
    const publisherId = req.params.id;
    const { rows } = await query(`SELECT id, name, domain, config, stripe_account_id FROM publishers WHERE id = $1`, [publisherId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Publisher not found' });
    const pub = rows[0];
    res.json({
      id: pub.id,
      name: pub.name,
      domain: pub.domain,
      config: pub.config,
      has_stripe: !!pub.stripe_account_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: List publishers
router.get('/', requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { rows } = await query(`
      SELECT p.id, p.name, p.domain, p.created_at, 
             COALESCE(SUM(a.views), 0) as total_views,
             COALESCE(SUM(a.clicks), 0) as total_clicks,
             COALESCE(SUM(a.price_cents), 0) as total_revenue_cents
      FROM publishers p
      LEFT JOIN ads a ON p.id = a.publisher_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create publisher (stubbed for brevity, could just use register flow)
router.post('/', requireAuth, requireAdmin, async (req: any, res: any) => {
  res.status(501).json({ error: 'Not implemented' });
});

// Admin: Delete publisher
router.delete('/:id', requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    await query(`DELETE FROM publishers WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete publisher' });
  }
});

// Publisher: Get account settings
router.get('/:id/settings', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    
    const { rows: pubRows } = await query(`SELECT name, domain FROM publishers WHERE id = $1`, [req.params.id]);
    if (pubRows.length === 0) return res.status(404).json({ error: 'Publisher not found' });
    
    const { rows: userRows } = await query(`SELECT email FROM users WHERE id = $1`, [req.user.id]);
    
    res.json({
      name: pubRows[0].name,
      domain: pubRows[0].domain,
      email: userRows[0]?.email || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Publisher: Update account settings
router.put('/:id', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    
    const { name, domain, email, password } = req.body;
    
    // Check if email is taken by another user
    const { rows: emailCheck } = await query(`SELECT id FROM users WHERE email = $1 AND id != $2`, [email, req.user.id]);
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    // Check if domain is taken by another publisher
    const { rows: domainCheck } = await query(`SELECT id FROM publishers WHERE domain = $1 AND id != $2`, [domain, req.params.id]);
    if (domainCheck.length > 0) {
      return res.status(400).json({ error: 'Domain is already registered by another account' });
    }

    // Update publisher
    await query(`UPDATE publishers SET name = $1, domain = $2 WHERE id = $3`, [name, domain, req.params.id]);

    // Update user
    if (password && password.trim().length > 0) {
      const password_hash = await bcrypt.hash(password, 10);
      await query(
        `UPDATE users SET email = $1, password_hash = $2 WHERE id = $3`, 
        [email, password_hash, req.user.id]
      );
    } else {
      await query(
        `UPDATE users SET email = $1 WHERE id = $2`, 
        [email, req.user.id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update account settings' });
  }
});

// Publisher: List team members
router.get('/:id/users', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    
    const { rows } = await query(`SELECT id, email, role, created_at FROM users WHERE publisher_id = $1 ORDER BY created_at ASC`, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Publisher: Add team member
router.post('/:id/users', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    
    const { email, password } = req.body;
    
    const { rows: emailCheck } = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (emailCheck.length > 0) return res.status(400).json({ error: 'Email is already registered' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (publisher_id, email, password_hash, role) VALUES ($1, $2, $3, 'publisher') RETURNING id, email, role, created_at`,
      [req.params.id, email, password_hash]
    );
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Publisher: Remove team member
router.delete('/:id/users/:userId', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    // Prevent deleting oneself
    if (req.user.id === req.params.userId) return res.status(400).json({ error: 'Cannot remove yourself' });
    
    await query(`DELETE FROM users WHERE id = $1 AND publisher_id = $2`, [req.params.userId, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});


// Publisher: Update config
router.put('/:id/config', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });
    const { config } = req.body;
    await query(`UPDATE publishers SET config = $1 WHERE id = $2`, [JSON.stringify(config), req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Get publisher's ads for moderation (Publisher only)
router.get('/:id/ads', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });

    const publisherId = req.params.id;
    const { rows } = await query(`
      SELECT id, data, tier, price_cents, status, start_time, end_time, created_at
      FROM ads 
      WHERE publisher_id = $1 
      ORDER BY created_at DESC
    `, [publisherId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject & Refund
router.post('/:id/ads/:adId/reject', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });

    const { id, adId } = req.params;
    
    const { rows } = await query(`SELECT stripe_payment_intent_id, status FROM ads WHERE id = $1 AND publisher_id = $2`, [adId, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ad not found' });
    
    const ad = rows[0];
    if (ad.status === 'rejected' || ad.status === 'refunded') {
      return res.status(400).json({ error: 'Ad is already rejected/refunded' });
    }

    if (ad.stripe_payment_intent_id) {
      await stripe.refunds.create({
        payment_intent: ad.stripe_payment_intent_id,
        reverse_transfer: true,
      });
    }

    await query(`UPDATE ads SET status = 'rejected' WHERE id = $1`, [adId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refund (for expired ads)
router.post('/:id/ads/:adId/refund', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });

    const { id, adId } = req.params;
    
    const { rows } = await query(`SELECT stripe_payment_intent_id, status FROM ads WHERE id = $1 AND publisher_id = $2`, [adId, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ad not found' });
    
    const ad = rows[0];
    if (ad.status === 'rejected' || ad.status === 'refunded') {
      return res.status(400).json({ error: 'Ad is already rejected/refunded' });
    }

    if (ad.stripe_payment_intent_id) {
      await stripe.refunds.create({
        payment_intent: ad.stripe_payment_intent_id,
        reverse_transfer: true,
      });
    }

    await query(`UPDATE ads SET status = 'refunded' WHERE id = $1`, [adId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload publisher logo
router.post('/:id/logo', requireAuth, upload.single('logo'), async (req: any, res: any) => {
  try {
    const publisherId = req.params.id;
    if (!canAccessPublisher(req, publisherId)) return res.status(403).json({ error: 'Unauthorized' });
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const logoUrl = `/uploads/${req.file.filename}`;
    res.json({ url: logoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe Connect Onboarding
router.post('/:id/onboard', requireAuth, async (req: any, res: any) => {
  try {
    if (!canAccessPublisher(req, req.params.id)) return res.status(403).json({ error: 'Forbidden' });

    const publisherId = req.params.id;
    
    const { rows } = await query('SELECT stripe_account_id FROM publishers WHERE id = $1', [publisherId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Publisher not found' });
    
    let accountId = rows[0].stripe_account_id;
    
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      await query('UPDATE publishers SET stripe_account_id = $1 WHERE id = $2', [accountId, publisherId]);
    }

    const origin = req.headers.origin || 'http://localhost:5174';

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard?refresh=true`,
      return_url: `${origin}/dashboard?return=true`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
