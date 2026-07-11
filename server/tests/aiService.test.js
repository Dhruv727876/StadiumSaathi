const aiService = require('../services/aiService');
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

describe('AIService Fallover Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return Gemini response and NOT invoke Gemma when Gemini succeeds', async () => {
    geminiService.generateContent.mockResolvedValue('Gemini Success response');

    const result = await aiService.processMessage('Test prompt', 'persona', 'en');

    expect(result).toEqual({
      provider: 'gemini',
      text: 'Gemini Success response'
    });
    expect(geminiService.generateContent).toHaveBeenCalledWith('Test prompt', 'persona', 'en');
    expect(gemmaService.generateContent).not.toHaveBeenCalled();
  });

  it('should fall back to Gemma and return its response when Gemini fails', async () => {
    geminiService.generateContent.mockRejectedValue(new Error('Gemini API Error'));
    gemmaService.generateContent.mockResolvedValue('Gemma Fallback response');

    const result = await aiService.processMessage('Test prompt', 'persona', 'en');

    expect(result).toEqual({
      provider: 'gemma',
      text: 'Gemma Fallback response'
    });
    expect(geminiService.generateContent).toHaveBeenCalledWith('Test prompt', 'persona', 'en');
    expect(gemmaService.generateContent).toHaveBeenCalledWith('Test prompt', 'persona', 'en');
  });

  it('should throw an orchestration error when BOTH Gemini and Gemma fail', async () => {
    geminiService.generateContent.mockRejectedValue(new Error('Gemini Offline'));
    gemmaService.generateContent.mockRejectedValue(new Error('Gemma Offline'));

    await expect(aiService.processMessage('Test prompt', 'persona', 'en')).rejects.toThrow(
      'AI Orchestration failure. Primary error: Gemini Offline. Fallback error: Gemma Offline'
    );

    expect(geminiService.generateContent).toHaveBeenCalledWith('Test prompt', 'persona', 'en');
    expect(gemmaService.generateContent).toHaveBeenCalledWith('Test prompt', 'persona', 'en');
  });
});
