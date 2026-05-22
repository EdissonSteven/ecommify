'use strict';

const authService = require('./auth.service');
const { pool } = require('../../db/postgres');

async function register(req, res) {
  const { email, password, name } = req.body;

  if (!authService.validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!authService.validatePasswordStrength(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with one uppercase letter and one number',
    });
  }

  try {
    const hash = await authService.hashPassword(password);
    const result = await pool.query(
      'INSERT INTO customers (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email.trim().toLowerCase(), hash, name]
    );
    const token = authService.generateJWT({ userId: result.rows[0].id, role: 'customer' });
    return res.status(201).json({ user: result.rows[0], token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, email, name, password_hash, login_attempts FROM customers WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const blockStatus = authService.checkLoginAttempts(user.login_attempts);
    if (blockStatus.blocked) {
      return res.status(429).json({ error: `Account blocked. Try again in ${blockStatus.minutesLeft} minutes.` });
    }

    const valid = await authService.verifyPassword(password, user.password_hash);
    if (!valid) {
      await pool.query('UPDATE customers SET login_attempts = login_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE customers SET login_attempts = 0 WHERE id = $1', [user.id]);
    const token = authService.generateJWT({ userId: user.id, role: 'customer' });
    return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
