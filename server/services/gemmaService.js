const axios = require('axios');
const logger = require('../utils/logger');
const { buildSystemPrompt } = require('./geminiService');

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
 * Service to interact with the NVIDIA Gemma model hosted API as a fallback.
 */
class GemmaService {
  /**
   * Generates content from the NVIDIA Gemma model with system prompt instructions and a 25s timeout.
   *
   * @param {string} prompt - The prompt text for the AI.
   * @param {string} [persona] - Optional persona name.
   * @param {string} [language] - Optional language preference.
   * @returns {Promise<string>} The generated response text.
   */
  async generateContent(prompt, persona, language) {
    const apiKey = process.env.NVIDIA_API_KEY || 'dummy_nvidia_key';
    const systemInstruction = buildSystemPrompt(persona, language);
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

    const apiCall = axios.post(url, {
      model: 'google/gemma-2-9b-it',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    try {
      logger.info('Initiating Gemma fallback AI request with 25s timeout');
      const response = await withTimeout(apiCall, 25000);
      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Invalid or empty response structure from NVIDIA Gemma API');
      }
      return text;
    } catch (error) {
      logger.error('Gemma request failed or timed out:', error.message);
      throw error;
    }
  }
}

/**
 * Exported GemmaService singleton instance.
 */
module.exports = new GemmaService();
