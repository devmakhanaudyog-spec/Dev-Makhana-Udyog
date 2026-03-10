const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - OTP expiry timestamp
 * @returns {boolean} true if OTP is expired
 */
exports.isOTPExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};

/**
 * Generate OTP expiry time
 * @param {number} minutes - Minutes until expiry (default: 10)
 * @returns {Date} Expiry timestamp
 */
exports.generateOTPExpiryTime = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Generate a secure random password for Google users
 * @returns {string} Secure random password
 */
exports.generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex');
};
