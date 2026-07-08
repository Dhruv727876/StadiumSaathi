const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Builds the system prompt for the specified AI persona and language.
 *
 * @param {string} persona - Name or role of the AI persona.
 * @param {string} language - Target language context.
 * @returns {string} The fully constructed system prompt.
 */
function buildSystemPrompt(persona, language) {
  const selectedPersona = persona || 'StadiumAssistant';
  const selectedLang = language || 'English';

  return `You are ${selectedPersona}, a GenAI-enabled stadium operations and fan experience assistant for the FIFA World Cup 2026.
Your primary role is to assist fans, venue staff, volunteers, and organizers.

Knowledge Pillars:
1. Wayfinding: Provide directions, gate locations, stands, concourses, and amenities information. Always prefix wayfinding responses with "STADIUM_GUIDANCE:".
2. Gate/Zone Crowd Status: Help manage queues, suggest alternative pathways, and report zone capacities.
3. Transport Options: Suggest transit paths, bus links, ride-shares, parking lots, and metro connections.
4. Accessibility Routing: Offer step-free access paths, elevator locations, and assistance contact details.
5. Sustainability Tips: Remind users of recycling stations, water refills, and zero-waste initiatives.
6. Tournament Schedule: Offer match schedules, timings, group information, and match status details.
7. Emergency Procedures: Provide evacuation directions, medical station locations, and emergency contacts.
8. Multilingual Support: Dynamically detect the user's language, adapt, and answer in that language. (Preferred default: ${selectedLang}).

Hard Limits:
- Rely strictly on verified venue data. If details are unknown, state it clearly.
- Never make up seat availability or match ticket pricing.

Output Format:
- If answering wayfinding queries, prefix the block with "STADIUM_GUIDANCE:".
- Every response MUST end with exactly ONE concrete next action for the user (e.g., "Next step: Please proceed to Gate A.").
`;
}

/**
 * Executes a promise with a timeout limit.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to monitor.
 * @param {number} ms - Timeout threshold in milliseconds.
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Service to interact with the Google Gemini 2.5 Flash model API.
 */
class GeminiService {
  /**
   * Generates content from the Gemini 2.5 Flash model with system prompt instructions and a 25s timeout.
   *
   * @param {string} prompt - The user prompt text.
   * @param {string} [persona] - Optional persona name.
   * @param {string} [language] - Optional language preference.
   * @returns {Promise<string>} The generated response text.
   */
  async generateContent(prompt, persona, language) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }

    const systemInstruction = buildSystemPrompt(persona, language);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const apiCall = axios.post(url, {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser Input: ${prompt}` }]
      }]
    });

    try {
      logger.info('Initiating Gemini AI request with 25s timeout');
      const response = await withTimeout(apiCall, 25000);
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid or empty response structure from Gemini API');
      }
      return text;
    } catch (error) {
      logger.error('Gemini request failed or timed out:', error.message);
      throw error;
    }
  }
}

/**
 * Exported GeminiService singleton instance and system prompt builder helper.
 */
module.exports = {
  geminiService: new GeminiService(),
  buildSystemPrompt
};
