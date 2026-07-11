const request = require('supertest');
const { app } = require('../index');
const { geminiService } = require('../services/geminiService');
const gemmaService = require('../services/gemmaService');

jest.mock('../services/geminiService', () => {
  const original = jest.requireActual('../services/geminiService');
  return {
    ...original,
    geminiService: {
      generateContent: jest.fn()
    }
  };
});

jest.mock('../services/gemmaService', () => {
  return {
    generateContent: jest.fn()
  };
});

describe('POST /api/chat - Validation & Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and AI response on valid input', async () => {
    geminiService.generateContent.mockResolvedValue('Simulated GenAI Response');

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

  it('should sanitize and not leak internal error strings on Gemini and Gemma double failure', async () => {
    geminiService.generateContent.mockRejectedValue(new Error('Internal Gemini Database Error'));
    gemmaService.generateContent.mockRejectedValue(new Error('NVIDIA API connection refused'));

    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Help me find the exit' });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('message', 'A secure server error occurred. Please contact venue administration.');
    
    // Assert that the raw error details are NOT present in the body
    expect(JSON.stringify(res.body)).not.toContain('Internal Gemini Database Error');
    expect(JSON.stringify(res.body)).not.toContain('NVIDIA API connection refused');
  });
});
