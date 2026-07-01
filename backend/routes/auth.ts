import { Router } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Secret should be in env vars, fallback for dev
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { rows: users } = await query('SELECT id, publisher_id, password_hash, role FROM users WHERE email = $1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, publisher_id: user.publisher_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // If they have a publisher_id, fetch the config to send back
    let config = {};
    if (user.publisher_id) {
      const { rows: publishers } = await query('SELECT config FROM publishers WHERE id = $1', [user.publisher_id]);
      if (publishers.length > 0) {
        config = publishers[0].config;
      }
    }

    res.json({ token, id: user.id, publisher_id: user.publisher_id, role: user.role, config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, domain, email, password } = req.body;
    
    if (!name || !domain || !email || !password) {
      return res.status(400).json({ error: 'Name, domain, email, and password required' });
    }

    // Check if email already exists in users table
    const checkEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkEmail.rowCount && checkEmail.rowCount > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Check if domain already exists in publishers table
    const checkDomain = await query('SELECT id FROM publishers WHERE domain = $1', [domain]);
    if (checkDomain.rowCount && checkDomain.rowCount > 0) {
      return res.status(400).json({ error: 'Domain already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const role = 'publisher'; // Should we call it 'publisher_admin' or just 'publisher'? Let's keep 'publisher'.
    const defaultConfig = {
      adSchema: [
        { name: 'headline', label: 'Headline', type: 'text', required: true, maxLength: 50 },
        { name: 'body_text', label: 'Body Text', type: 'textarea', required: true, maxLength: 200 },
        { name: 'link_url', label: 'Link URL', type: 'url', required: true },
        { name: 'image', label: 'Ad Image', type: 'file', required: true }
      ],
      tiers: [
        { id: '1-day', name: '1 Day TownTicker Ad', duration_hours: 24, price_cents: 2500 },
        { id: '3-day', name: '3 Day TownTicker Ad', duration_hours: 72, price_cents: 5000 }
      ],
      formConfig: {
        title: 'Buy a TownTicker Ad',
        description: 'Your ad will go live instantly after payment.'
      },
      widgetConfig: {
        styles: { layout: 'vertical' }
      }
    };

    // First insert publisher
    const { rows: pubRows } = await query(`
      INSERT INTO publishers (name, domain, config)
      VALUES ($1, $2, $3)
      RETURNING id, config;
    `, [name, domain, JSON.stringify(defaultConfig)]);
    
    const publisher = pubRows[0];

    // Then insert user
    const { rows: userRows } = await query(`
      INSERT INTO users (publisher_id, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, role;
    `, [publisher.id, email, password_hash, role]);

    const user = userRows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, publisher_id: publisher.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, id: user.id, publisher_id: publisher.id, role: user.role, config: publisher.config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// Middleware for protected routes
export const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, publisher_id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
