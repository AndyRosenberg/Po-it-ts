/**
 * Validates if a string is in email format
 * @param {string} email - The string to validate
 * @returns {boolean} - True if string is in email format, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};