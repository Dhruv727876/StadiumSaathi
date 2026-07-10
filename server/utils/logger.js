const util = require('util');

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
    process.stdout.write(util.format(`[INFO] ${message}`, ...args) + '\n');
  },

  /**
   * Logs a warning.
   *
   * @param {string} message - Warning description.
   * @param {...unknown} args - Supporting details.
   */
  warn: (message, ...args) => {
    process.stderr.write(util.format(`[WARN] ${message}`, ...args) + '\n');
  },

  /**
   * Logs an error.
   *
   * @param {string} message - Error description.
   * @param {...unknown} args - Supporting details.
   */
  error: (message, ...args) => {
    process.stderr.write(util.format(`[ERROR] ${message}`, ...args) + '\n');
  }
};

/**
 * Exported server side logger utility.
 */
module.exports = logger;
