import { Router } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logEvent } from '../logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export function requireAdvertiserAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded.advertiser_id) {
      return res.status(403).json({ error: 'Forbidden: Advertiser access required' });
    }
    req.user = decoded; // { advertiser_id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, publisher_id } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { rows: existing } = await query('SELECT id FROM advertisers WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { rows: newUsers } = await query(
      'INSERT INTO advertisers (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, password_hash]
    );

    const user = newUsers[0];

    const token = jwt.sign(
      { advertiser_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (publisher_id) {
      await query(
        'INSERT INTO publisher_advertisers (publisher_id, advertiser_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [publisher_id, user.id]
      );
    }

    await logEvent('ADVERTISER_REGISTERED', 'advertiser', user.id, { email, publisher_id });

    res.status(201).json({ token, advertiser: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, publisher_id } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { rows: users } = await query('SELECT id, email, password_hash FROM advertisers WHERE email = $1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { advertiser_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (publisher_id) {
      await query(
        'INSERT INTO publisher_advertisers (publisher_id, advertiser_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [publisher_id, user.id]
      );
    }

    await logEvent('ADVERTISER_LOGIN', 'advertiser', user.id, { email, publisher_id });

    res.json({ token, advertiser: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAdvertiserAuth, async (req: any, res) => {
  try {
    const { rows: users } = await query('SELECT id, email, name, company_name, created_at FROM advertisers WHERE id = $1', [req.user.advertiser_id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Advertiser not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', requireAdvertiserAuth, async (req: any, res) => {
  try {
    const { email, password, name, company_name } = req.body;
    
    // Check if updating email to one that already exists
    if (email) {
      const { rows: existing } = await query('SELECT id FROM advertisers WHERE email = $1 AND id != $2', [email, req.user.advertiser_id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email is already taken by another account' });
      }
    }

    // Update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (company_name !== undefined) {
      updates.push(`company_name = $${paramIndex++}`);
      values.push(company_name);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(password_hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.advertiser_id);
    const queryStr = `UPDATE advertisers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, company_name`;
    
    const { rows } = await query(queryStr, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Advertiser not found' });
    }

    await logEvent('ADVERTISER_UPDATED', 'advertiser', req.user.advertiser_id, { email, name, company_name });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/ads', requireAdvertiserAuth, async (req: any, res) => {
  try {
    const { rows: ads } = await query(
      `SELECT id, publisher_id, tier, duration_hours, price_cents, status, views, clicks, start_time, end_time, created_at, data
       FROM ads 
       WHERE advertiser_id = $1 OR advertiser_email = $2 
       ORDER BY created_at DESC`,
      [req.user.advertiser_id, req.user.email]
    );

    // If any ads matched on email but didn't have advertiser_id, update them implicitly
    await query(
      `UPDATE ads SET advertiser_id = $1 WHERE advertiser_email = $2 AND advertiser_id IS NULL`,
      [req.user.advertiser_id, req.user.email]
    );

    res.json(ads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
