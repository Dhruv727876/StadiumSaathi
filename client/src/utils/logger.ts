/* eslint-disable no-console */

/**
 * Diagnostic logger utility that restricts console prints to development environments only.
 */
export const logger = {
  /**
   * Logs an informational message to the console in development mode.
   *
   * @param message - The text message to log.
   * @param args - Additional metadata or objects to inspect.
   */
  info: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Logs a warning message to the console in development mode.
   *
   * @param message - The warning description.
   * @param args - Additional context parameters.
   */
  warn: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Logs an error message to the console in development mode.
   *
   * @param message - The error description.
   * @param args - Additional error details.
   */
  error: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};
