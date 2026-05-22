'use strict';

const {
  InsufficientStockError,
  validateShippingAddress,
  validatePaymentMethod,
  generateOrderNumber,
  calculateOrderTotal,
  processStockDecrement,
  buildOrderSummary,
} = require('../../src/modules/checkout/checkout.service');

describe('CheckoutService', () => {

  describe('HU-06: Proceso de compra', () => {

    // CP-CH-01
    test('Given a complete address, When validateShippingAddress is called, Then it returns { valid: true }', () => {
      // Arrange
      const address = {
        street: 'Calle 100 # 50-20',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
      };

      // Act
      const result = validateShippingAddress(address);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    // CP-CH-02
    test('Given an address without city, When validateShippingAddress is called, Then it returns { valid: false, errors: ["city required"] }', () => {
      // Arrange
      const address = {
        street: 'Calle 100 # 50-20',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
      };

      // Act
      const result = validateShippingAddress(address);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('city required');
    });

    // CP-CH-03
    test('Given payment method "credit_card", When validatePaymentMethod is called, Then it returns true', () => {
      // Arrange
      const method = 'credit_card';

      // Act
      const result = validatePaymentMethod(method);

      // Assert
      expect(result).toBe(true);
    });

    // CP-CH-04
    test('Given payment method "bitcoin", When validatePaymentMethod is called, Then it returns false', () => {
      // Arrange
      const method = 'bitcoin';

      // Act
      const result = validatePaymentMethod(method);

      // Assert
      expect(result).toBe(false);
    });

    // CP-CH-05
    test('Given no arguments, When generateOrderNumber is called, Then it returns a string starting with "ORD-"', () => {
      // Act
      const orderNumber = generateOrderNumber();

      // Assert
      expect(typeof orderNumber).toBe('string');
      expect(orderNumber).toMatch(/^ORD-[A-Z0-9]{8}$/);
    });

    // CP-CH-06
    test('Given items and a shipping cost, When calculateOrderTotal is called, Then it returns the correct sum', () => {
      // Arrange
      const items = [
        { price: 1500, qty: 1 },
        { price: 800,  qty: 2 },
      ];
      const shipping = 50;

      // Act
      const result = calculateOrderTotal(items, shipping);

      // Assert
      expect(result).toBe(3150);
    });

    // CP-CH-07
    test('Given items with sufficient stock, When processStockDecrement is called, Then it returns the decremented inventory', () => {
      // Arrange
      const items = [{ id: 'p1', qty: 2 }, { id: 'p2', qty: 1 }];
      const inventory = { p1: 10, p2: 5 };

      // Act
      const result = processStockDecrement(items, inventory);

      // Assert
      expect(result.p1).toBe(8);
      expect(result.p2).toBe(4);
    });

    // CP-CH-08
    test('Given items with insufficient stock, When processStockDecrement is called, Then it throws without modifying inventory', () => {
      // Arrange
      const items = [{ id: 'p1', qty: 20 }];
      const inventory = { p1: 5 };

      // Act & Assert
      expect(() => processStockDecrement(items, inventory)).toThrow(InsufficientStockError);
      expect(inventory.p1).toBe(5);
    });

    // CP-CH-09
    test('Given a cart, address and payment, When buildOrderSummary is called, Then it returns an object with required fields', () => {
      // Arrange
      const cart = [{ id: 'p1', name: 'Laptop', price: 1500, qty: 1 }];
      const address = { street: 'Calle 1', city: 'Bogotá', state: 'Cundi', zipCode: '110', country: 'CO' };
      const payment = 'credit_card';

      // Act
      const result = buildOrderSummary(cart, address, payment);

      // Assert
      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('address');
      expect(result.orderId).toMatch(/^ORD-/);
    });

    // Extra: validatePaymentMethod for all valid methods
    test('Given all valid payment methods, When validatePaymentMethod is called, Then it returns true for each', () => {
      // Arrange
      const methods = ['credit_card', 'boleto', 'debit_card'];

      // Act & Assert
      methods.forEach(method => {
        expect(validatePaymentMethod(method)).toBe(true);
      });
    });
  });
});
