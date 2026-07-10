const aiService = require('../services/aiService');
const { geminiService, buildSystemPrompt } = require('../services/geminiService');

jest.mock('../services/geminiService', () => {
  const original = jest.requireActual('../services/geminiService');
  return {
    ...original,
    geminiService: {
      generateContent: jest.fn()
    }
  };
});
jest.mock('../services/gemmaService');

describe('Gemini Prompt & Persona Configurations', () => {
  it('should compile system prompt containing selected persona and target language', () => {
    const prompt = buildSystemPrompt('SpecialistGuide', 'Español');
    expect(prompt).toContain('SpecialistGuide');
    expect(prompt).toContain('Español');
  });

  it('should default to StadiumAssistant if persona name is empty or missing', () => {
    const prompt = buildSystemPrompt('', 'English');
    expect(prompt).toContain('StadiumAssistant');
  });

  it('should contain the mandatory next-action formatting rules', () => {
    const prompt = buildSystemPrompt('StadiumAssistant', 'English');
    expect(prompt).toContain('Every response MUST end with exactly ONE concrete next action');
  });

  it('should process Gemini output correctly', async () => {
    geminiService.generateContent.mockResolvedValue('STADIUM_GUIDANCE: Head to stands. Next step: Follow signs.');
    const result = await aiService.processMessage('Where is Section A?');
    expect(result.provider).toEqual('gemini');
    expect(result.text).toContain('STADIUM_GUIDANCE:');
  });
});
