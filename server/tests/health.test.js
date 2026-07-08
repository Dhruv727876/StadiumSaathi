const request = require('supertest');
const { app } = require('../index');

describe('GET /health', () => {
  it('should return 200 OK and status UP under 200ms', async () => {
    const startTime = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - startTime;

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(duration).toBeLessThan(200);
  });
});
