import request from 'supertest';
import express from 'express';
import webhooksRouter from '../routes/webhooks';

// Mock DB and Stripe
jest.mock('../db', () => ({
  query: jest.fn()
}));
const { query } = require('../db');

jest.mock('../stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn()
    }
  }
}));
const { stripe } = require('../stripe');

const app = express();
// Webhook route requires raw parser
app.use('/api/webhooks', express.raw({type: 'application/json'}), webhooksRouter);

describe('POST /api/webhooks/stripe', () => {
  it('should update ad status to active on checkout.session.completed', async () => {
    // Mock constructEvent to return a valid event
    stripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'ad123',
          payment_intent: 'pi_test'
        }
      }
    });

    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ duration_hours: 24 }] }); // SELECT duration
    query.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE ad

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_sig')
      .send(JSON.stringify({})); // Body content doesn't matter for mock

    expect(res.status).toBe(200);

    // Verify DB update was called
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain("SET status = 'active'");
    expect(query.mock.calls[1][1]).toEqual(['pi_test', 24, 'ad123']);
  });
});
