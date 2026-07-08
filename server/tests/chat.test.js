const request = require('supertest');
const { app } = require('../index');
const aiService = require('../services/aiService');

jest.mock('../services/aiService');

describe('POST /api/chat - Validation & Integration', () => {
  it('should return 200 and AI response on valid input', async () => {
    aiService.processMessage.mockResolvedValue({
      provider: 'gemini',
      text: 'Simulated GenAI Response'
    });

    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Where is the main entrance?' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('response', 'Simulated GenAI Response');
  });

  it('should return 400 Bad Request if message is missing or empty', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ persona: 'StadiumAssistant' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  it('should return 400 Bad Request if persona name is invalid or too long', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        message: 'Hello',
        persona: 'A'.repeat(150) // exceeds max 100 limit
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });
});
