'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommify_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_MINUTES = 5;

/**
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Min 8 chars, at least 1 uppercase, at least 1 digit.
 * @param {string} password
 * @returns {boolean}
 */
function validatePasswordStrength(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * @param {object} payload
 * @returns {string}
 */
function generateJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * @param {string} token
 * @returns {object|null}
 */
function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Returns block status after repeated failed login attempts.
 * @param {number} attempts
 * @returns {{ blocked: boolean, minutesLeft?: number }}
 */
function checkLoginAttempts(attempts) {
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return { blocked: true, minutesLeft: BLOCK_MINUTES };
  }
  return { blocked: false };
}

module.exports = {
  validateEmail,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  checkLoginAttempts,
};
