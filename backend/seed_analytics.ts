import { query } from './db';
async function seed() {
  const pubId = '00000000-0000-0000-0000-000000000000';
  await query(`
    INSERT INTO ads (publisher_id, data, tier, duration_hours, price_cents, status, views, clicks)
    VALUES 
    ($1, '{"headline":"Ad 1"}', '1-day', 24, 2500, 'active', 1500, 45),
    ($1, '{"headline":"Ad 2"}', '3-day', 72, 6000, 'active', 3200, 112)
  `, [pubId]);
  
  const adminPubId = '11111111-1111-1111-1111-111111111111';
  await query(`
    INSERT INTO ads (publisher_id, data, tier, duration_hours, price_cents, status, views, clicks)
    VALUES 
    ($1, '{"headline":"System Ad"}', '7-day', 168, 12000, 'active', 50000, 4000)
  `, [adminPubId]);
  
  console.log('Seeded analytics');
  process.exit(0);
}
seed();
