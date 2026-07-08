const { geminiService } = require('./geminiService');
const gemmaService = require('./gemmaService');
const logger = require('../utils/logger');

/**
 * Orchestrates GenAI requests, attempting Gemini first and falling back to NVIDIA Gemma.
 */
class AIService {
  /**
   * Processes a prompt message by attempting primary model (Gemini 2.5 Flash),
   * falling back to secondary model (NVIDIA Gemma 2.5) if an error occurs.
   *
   * @param {string} prompt - The user or system prompt to process.
   * @param {string} [persona] - Custom persona name to instruct the LLM.
   * @param {string} [language] - Default language output preference.
   * @returns {Promise<{ provider: 'gemini' | 'gemma', text: string }>} The result containing the provider and response text.
   */
  async processMessage(prompt, persona, language) {
    try {
      logger.info('Attempting primary generation via Gemini');
      const text = await geminiService.generateContent(prompt, persona, language);
      return {
        provider: 'gemini',
        text
      };
    } catch (primaryError) {
      logger.warn(`Primary AI provider (Gemini) failed: ${primaryError.message}. Triggering NVIDIA Gemma fallback.`);
      try {
        const text = await gemmaService.generateContent(prompt, persona, language);
        return {
          provider: 'gemma',
          text
        };
      } catch (fallbackError) {
        logger.error(`AI orchestrator system failure: ${fallbackError.message}`);
        throw new Error(
          `AI Orchestration failure. Primary error: ${primaryError.message}. Fallback error: ${fallbackError.message}`
        );
      }
    }
  }
}

/**
 * Exported AIService singleton instance.
 */
module.exports = new AIService();
