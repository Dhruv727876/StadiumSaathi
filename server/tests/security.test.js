const request = require('supertest');
const { app } = require('../index');
const aiService = require('../services/aiService');

jest.mock('../services/aiService');

describe('Security Layer Configurations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include helmet security headers on health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  it('should reject requests that exceed payload size limits', async () => {
    const oversizedMessage = 'A'.repeat(5000); // larger than validator or json payload limits
    const res = await request(app)
      .post('/api/chat')
      .send({ message: oversizedMessage });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  it('should escape XSS payloads and sanitize inputs', async () => {
    aiService.processMessage.mockResolvedValue({
      provider: 'gemini',
      text: 'Response text'
    });

    const res = await request(app)
      .post('/api/chat')
      .send({ message: '<script>alert("xss")</script>' });

    expect(res.statusCode).toEqual(200);
    // express-validator escapes "<" to "&lt;" and ">" to "&gt;"
    expect(aiService.processMessage).toHaveBeenCalledWith(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      undefined,
      undefined
    );
  });

  it('should reject malformed JSON payloads', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Content-Type', 'application/json')
      .send('{ message: malformed_string_here');

    expect(res.statusCode).toEqual(400);
  });
});
