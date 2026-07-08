/**
 * Server side logger utility that routes logs with levels.
 */
const logger = {
  /**
   * Logs an info message.
   *
   * @param {string} message - Info description.
   * @param {...unknown} args - Supporting details.
   */
  info: (message, ...args) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, ...args);
  },

  /**
   * Logs a warning.
   *
   * @param {string} message - Warning description.
   * @param {...unknown} args - Supporting details.
   */
  warn: (message, ...args) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Logs an error.
   *
   * @param {string} message - Error description.
   * @param {...unknown} args - Supporting details.
   */
  error: (message, ...args) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  }
};

/**
 * Exported server side logger utility.
 */
module.exports = logger;
