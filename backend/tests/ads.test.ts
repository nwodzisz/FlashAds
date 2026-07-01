import request from 'supertest';
import express from 'express';
import adsRouter from '../routes/ads';

// Mock DB
jest.mock('../db', () => ({
  query: jest.fn()
}));

const { query } = require('../db');

const app = express();
app.use(express.json());
app.use('/api/ads', adsRouter);

describe('GET /api/ads', () => {
  it('should fetch up to 3 random active ads for a publisher', async () => {
    const mockAds = [
      { id: '1', data: { headline: 'Ad 1', body_text: 'Text 1', link_url: 'http://link1', image_url: '/img1.png' } },
      { id: '2', data: { headline: 'Ad 2', body_text: 'Text 2', link_url: 'http://link2', image_url: '/img2.png' } },
    ];
    
    query.mockResolvedValueOnce({ rows: [{ config: { widgetConfig: { styles: { layout: 'horizontal' } } } }] });
    query.mockResolvedValueOnce({ rows: mockAds });

    const res = await request(app).get('/api/ads?publisher=pub123');

    expect(res.status).toBe(200);
    expect(res.body.ads).toEqual(mockAds);
    expect(res.body.config).toEqual({ styles: { layout: 'horizontal' } });
    
    // Verify query was called properly
    expect(query).toHaveBeenCalled();
    const queryCall = query.mock.calls[1];
    expect(queryCall[0]).toContain("status = 'active'");
    expect(queryCall[0]).toContain("start_time <= NOW()");
    expect(queryCall[0]).toContain("end_time >= NOW()");
    expect(queryCall[0]).toContain("ORDER BY RANDOM()");
    expect(queryCall[0]).toContain("LIMIT 3");
  });
});
