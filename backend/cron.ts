import { query } from './db';

export function startCronJobs() {
  const checkExpiredAds = async () => {
    try {
      // Find active ads that have passed their end_time
      const { rows } = await query(`
        SELECT a.id, a.advertiser_email, a.views, p.name as publisher_name, p.id as publisher_id
        FROM ads a
        JOIN publishers p ON a.publisher_id = p.id
        WHERE a.status = 'active' AND a.end_time < NOW()
      `);

      for (const ad of rows) {
        // Mark as expired
        await query(`UPDATE ads SET status = 'expired' WHERE id = $1`, [ad.id]);

        // Send automated email via console
        if (ad.advertiser_email) {
          console.log(`\n======================================================`);
          console.log(`📧 AUTOMATED EMAIL TO: ${ad.advertiser_email}`);
          console.log(`Subject: Your ad on ${ad.publisher_name} just finished!`);
          console.log(`\nYour ad on ${ad.publisher_name} just finished! It was displayed in the TownTicker widget ${ad.views} times. Click here to renew it: http://localhost:5174/?publisher=${ad.publisher_id}`);
          console.log(`======================================================\n`);
        }
      }
    } catch (error) {
      console.error('Error checking for expired ads:', error);
    }
  };

  // Run on startup
  checkExpiredAds();

  // Then run every 10 seconds (for testing, in prod this would be longer e.g. 1 min or 1 hr)
  setInterval(checkExpiredAds, 10000); 

  console.log('Cron jobs started: Checking for expired ads every 10s');
}
