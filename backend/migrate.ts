import { pool } from './db';
pool.query('ALTER TABLE ads ADD COLUMN IF NOT EXISTS advertiser_email VARCHAR(255);')
  .then(() => pool.query('ALTER TABLE ads ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;'))
  .then(() => pool.query('ALTER TABLE ads ADD COLUMN IF NOT EXISTS clicks INT NOT NULL DEFAULT 0;'))
  .then(() => {console.log('Migrated'); process.exit(0)})
  .catch((e) => {console.error(e); process.exit(1)});
