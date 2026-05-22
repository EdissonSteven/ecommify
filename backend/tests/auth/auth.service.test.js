'use strict';

const {
  validateEmail,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  checkLoginAttempts,
} = require('../../src/modules/auth/auth.service');

describe('AuthService', () => {

  describe('HU-01: Registro de usuario', () => {

    // CP-AU-01
    test('Given a valid email, When validateEmail is called, Then it returns true', () => {
      // Arrange
      const validEmail = 'usuario@example.com';

      // Act
      const result = validateEmail(validEmail);

      // Assert
      expect(result).toBe(true);
    });

    // CP-AU-02
    test('Given an email without @, When validateEmail is called, Then it returns false', () => {
      // Arrange
      const invalidEmail = 'usuarioexample.com';

      // Act
      const result = validateEmail(invalidEmail);

      // Assert
      expect(result).toBe(false);
    });

    // CP-AU-03
    test('Given a strong password (>=8 chars, uppercase, number), When validatePasswordStrength is called, Then it returns true', () => {
      // Arrange
      const strongPassword = 'Password1';

      // Act
      const result = validatePasswordStrength(strongPassword);

      // Assert
      expect(result).toBe(true);
    });

    // CP-AU-04
    test('Given a password without uppercase letters, When validatePasswordStrength is called, Then it returns false', () => {
      // Arrange
      const weakPassword = 'password1';

      // Act
      const result = validatePasswordStrength(weakPassword);

      // Assert
      expect(result).toBe(false);
    });

    // CP-AU-05
    test('Given a password shorter than 8 characters, When validatePasswordStrength is called, Then it returns false', () => {
      // Arrange
      const shortPassword = 'Pass1';

      // Act
      const result = validatePasswordStrength(shortPassword);

      // Assert
      expect(result).toBe(false);
    });

    // Extra: password without digits
    test('Given a password without digits, When validatePasswordStrength is called, Then it returns false', () => {
      // Arrange
      const noDigitPassword = 'PasswordOnly';

      // Act
      const result = validatePasswordStrength(noDigitPassword);

      // Assert
      expect(result).toBe(false);
    });

    // Extra: hashPassword + verifyPassword round-trip
    test('Given a plaintext password, When hashPassword and verifyPassword are called, Then verifyPassword returns true', async () => {
      // Arrange
      const plain = 'SecurePass1';

      // Act
      const hash = await hashPassword(plain);
      const result = await verifyPassword(plain, hash);

      // Assert
      expect(result).toBe(true);
    });

    // Extra: verifyPassword with wrong password
    test('Given a wrong password, When verifyPassword is called, Then it returns false', async () => {
      // Arrange
      const plain = 'SecurePass1';
      const hash = await hashPassword(plain);

      // Act
      const result = await verifyPassword('WrongPass2', hash);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('HU-02: Login de usuario', () => {

    // CP-AU-06
    test('Given a valid payload, When generateJWT is called, Then it returns a non-empty string', () => {
      // Arrange
      const payload = { userId: 'u1', role: 'customer' };

      // Act
      const token = generateJWT(payload);

      // Assert
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    // CP-AU-07
    test('Given a valid token, When verifyJWT is called, Then it returns the correct payload', () => {
      // Arrange
      const payload = { userId: 'u1', role: 'customer' };
      const token = generateJWT(payload);

      // Act
      const decoded = verifyJWT(token);

      // Assert
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe('u1');
      expect(decoded.role).toBe('customer');
    });

    // CP-AU-08
    test('Given an invalid token, When verifyJWT is called, Then it returns null', () => {
      // Arrange
      const invalidToken = 'invalid.token.string';

      // Act
      const result = verifyJWT(invalidToken);

      // Assert
      expect(result).toBeNull();
    });

    // CP-AU-09
    test('Given 2 failed login attempts, When checkLoginAttempts is called, Then account is not blocked', () => {
      // Arrange
      const attempts = 2;

      // Act
      const result = checkLoginAttempts(attempts);

      // Assert
      expect(result.blocked).toBe(false);
    });

    // CP-AU-10
    test('Given 3 failed login attempts, When checkLoginAttempts is called, Then account is blocked for 5 minutes', () => {
      // Arrange
      const attempts = 3;

      // Act
      const result = checkLoginAttempts(attempts);

      // Assert
      expect(result.blocked).toBe(true);
      expect(result.minutesLeft).toBe(5);
    });

    // Extra: more than 3 attempts still blocked
    test('Given 5 failed login attempts, When checkLoginAttempts is called, Then account is still blocked', () => {
      // Arrange
      const attempts = 5;

      // Act
      const result = checkLoginAttempts(attempts);

      // Assert
      expect(result.blocked).toBe(true);
      expect(result.minutesLeft).toBe(5);
    });
  });
});
