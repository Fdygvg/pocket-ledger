const crypto = require('crypto');

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default: 64 = 128 hex chars)
 * @returns {string} Random hex string
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a shorter token for display purposes
 * @param {number} length - Token length in bytes (default: 8 = 16 hex chars)
 * @returns {string} Short hex string
 */
const generateDisplayToken = (length = 8) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a unique username with prefix
 * @param {string} prefix - Username prefix (default: 'user')
 * @returns {string} Unique username
 */
const generateUsername = (prefix = 'user') => {
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${randomSuffix}`;
};

/**
 * Generate a random color from preset themes
 * @returns {Object} Theme object with color, name, and icon
 */
const generateRandomTheme = () => {
  const themes = [
    { color: '#3B82F6', name: 'Blue', icon: '📁' },
    { color: '#10B981', name: 'Green', icon: '💰' },
    { color: '#EF4444', name: 'Red', icon: '🔥' },
    { color: '#8B5CF6', name: 'Purple', icon: '👑' },
    { color: '#F59E0B', name: 'Yellow', icon: '⭐' },
    { color: '#EC4899', name: 'Pink', icon: '🌸' },
    { color: '#6366F1', name: 'Indigo', icon: '🌌' },
    { color: '#6B7280', name: 'Gray', icon: '⚙️' }
  ];

  return themes[Math.floor(Math.random() * themes.length)];
};

/**
 * Generate a random emoji from a curated list
 * @returns {string} Random emoji
 */
const generateRandomEmoji = () => {
  const emojis = [
    '🍕', '☕', '🚗', '🏠', '👕', '🎬', '🎮', '📚',
    '✈️', '🏥', '🎁', '💻', '📱', '🛒', '🍎', '🏋️',
    '🎵', '🎨', '🐶', '🌮', '🍺', '🎓', '💊', '💡'
  ];

  return emojis[Math.floor(Math.random() * emojis.length)];
};

/**
 * Generate a random tag emoji from a smaller set
 * @returns {string} Random tag emoji
 */
const generateRandomTag = () => {
  const tags = ['📝', '💰', '🛒', '🍽️', '🚗', '🏠', '🎮', '👕', '🎁', '💡'];
  return tags[Math.floor(Math.random() * tags.length)];
};

/**
 * Hash a token using bcrypt (for use in models)
 * @param {string} token - Plain token to hash
 * @returns {Promise<string>} Hashed token
 */
const hashToken = async (token) => {
  // Note: bcrypt is imported in models, not here
  // This is just a utility function signature
  throw new Error('Use bcrypt.hash() in the model instead');
};

/**
 * Validate token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid format
 */
const isValidTokenFormat = (token) => {
  return typeof token === 'string' &&
    token.length >= 64 &&
    token.length <= 128 &&
    /^[a-f0-9]+$/i.test(token);
};

/**
 * Generate a verification code (for future features)
 * @param {number} length - Code length (default: 6)
 * @returns {string} Numeric code
 */
const generateVerificationCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

module.exports = {
  generateSecureToken,
  generateDisplayToken,
  generateUsername,
  generateRandomTheme,
  generateRandomEmoji,
  generateRandomTag,
  hashToken,
  isValidTokenFormat,
  generateVerificationCode
};
