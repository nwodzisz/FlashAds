import { query } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    const adminHash = await bcrypt.hash('admin', 10);
    const pubHash = await bcrypt.hash('password', 10);

    const adminPubId = '11111111-1111-1111-1111-111111111111';
    const pubId = '00000000-0000-0000-0000-000000000000';
    
    const adminUserId = '22222222-2222-2222-2222-222222222222';
    const pubUserId = '33333333-3333-3333-3333-333333333333';

    const sampleConfig = {
      adSchema: [
        { name: 'headline', type: 'text', label: 'Headline', required: true },
        { name: 'body_text', type: 'textarea', label: 'Body Text', required: true },
        { name: 'link_url', type: 'url', label: 'Link URL', required: true },
        { name: 'image_url', type: 'file', label: 'Image', required: true }
      ],
      tiers: [
        { id: '1-day', name: '1-Day', duration_hours: 24, price_cents: 2500 },
        { id: '3-day', name: '3-Day', duration_hours: 72, price_cents: 6000 },
        { id: '7-day', name: '7-Day', duration_hours: 168, price_cents: 12000 }
      ],
      formConfig: {
        title: 'Create Your TownTickerAd',
        description: 'Publish an ad on our site instantly.',
        primaryColor: '#000000',
        backgroundColor: '#ffffff'
      },
      widgetConfig: {
        layout: 'grid',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      }
    };

    // Admin Publisher
    await query(`
      INSERT INTO publishers (id, name, domain)
      VALUES ($1, 'System Admin', 'admin.local')
      ON CONFLICT (domain) DO NOTHING;
    `, [adminPubId]);

    // Admin User
    await query(`
      INSERT INTO users (id, publisher_id, email, password_hash, role)
      VALUES ($1, $2, 'admin@admin.com', $3, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminUserId, adminPubId, adminHash]);

    // Sample Publisher
    await query(`
      INSERT INTO publishers (id, name, domain, stripe_account_id, config)
      VALUES ($1, 'Local News Co', 'localnews.com', 'acct_1MXXXXXXX', $2)
      ON CONFLICT (domain) DO NOTHING;
    `, [pubId, JSON.stringify(sampleConfig)]);

    // Sample User
    await query(`
      INSERT INTO users (id, publisher_id, email, password_hash, role)
      VALUES ($1, $2, 'pub@localnews.com', $3, 'publisher')
      ON CONFLICT (email) DO NOTHING;
    `, [pubUserId, pubId, pubHash]);

    console.log('Seed data inserted.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
