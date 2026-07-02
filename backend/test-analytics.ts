import { query } from './db';
async function test() {
  try {
    const res = await query(`
      SELECT p.id, p.name, p.domain, p.created_at, 
             COALESCE(SUM(a.views), 0) as total_views,
             COALESCE(SUM(a.clicks), 0) as total_clicks,
             COALESCE(SUM(a.price_cents), 0) as total_revenue_cents
      FROM publishers p
      LEFT JOIN ads a ON p.id = a.publisher_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
