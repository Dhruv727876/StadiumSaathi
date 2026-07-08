/**
 * Formats an ISO timestamp into a localized human-readable string.
 *
 * @param isoString - The ISO date-time string to parse and format.
 * @returns A formatted string or 'Invalid Date' if parsing fails.
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleString();
}

/**
 * Validates whether the given email address format is valid.
 *
 * @param email - The email string to validate.
 * @returns True if the email format matches, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
