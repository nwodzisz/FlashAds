import { query } from './db';

const run = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS advertisers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    await query(`
      ALTER TABLE ads 
      ADD COLUMN IF NOT EXISTS advertiser_id UUID REFERENCES advertisers(id);
    `);

    await query(`
      ALTER TABLE advertisers 
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS publisher_blocked_emails (
        publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (publisher_id, email)
      );
    `);

    await query(`
      ALTER TABLE advertisers 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS publisher_advertisers (
        publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
        advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (publisher_id, advertiser_id)
      );
    `);
    
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
};
run();
