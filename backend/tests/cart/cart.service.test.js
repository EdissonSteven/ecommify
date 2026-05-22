'use strict';

const {
  StockError,
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
  validateStockLimit,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
} = require('../../src/modules/cart/cart.service');

describe('CartService', () => {

  describe('HU-05: Gestión del carrito de compras', () => {

    // CP-CR-01
    test('Given 2 items with price and qty, When calculateSubtotal is called, Then it returns the correct sum', () => {
      // Arrange
      const items = [
        { price: 100, qty: 2 },
        { price: 50, qty: 3 },
      ];

      // Act
      const result = calculateSubtotal(items);

      // Assert
      expect(result).toBe(350);
    });

    // CP-CR-02
    test('Given an empty cart, When calculateSubtotal is called, Then it returns 0', () => {
      // Arrange
      const items = [];

      // Act
      const result = calculateSubtotal(items);

      // Assert
      expect(result).toBe(0);
    });

    // CP-CR-03
    test('Given a subtotal of 100 and 10% discount, When calculateDiscount is called, Then it returns 90', () => {
      // Arrange
      const subtotal = 100;
      const discountPercent = 10;

      // Act
      const result = calculateDiscount(subtotal, discountPercent);

      // Assert
      expect(result).toBe(90);
    });

    // CP-CR-04
    test('Given subtotal, discounted amount, and tax rate, When calculateTotal is called, Then it returns the correct final value', () => {
      // Arrange
      const subtotal = 100;
      const discounted = calculateDiscount(subtotal, 10); // 90
      const taxRate = 0.19;

      // Act
      const result = calculateTotal(subtotal, discounted, taxRate);

      // Assert
      expect(result).toBeCloseTo(107.1, 1);
    });

    // CP-CR-05
    test('Given requestedQty=5 and availableStock=2, When validateStockLimit is called, Then it throws StockError', () => {
      // Arrange
      const requestedQty = 5;
      const availableStock = 2;

      // Act & Assert
      expect(() => validateStockLimit(requestedQty, availableStock))
        .toThrow('Stock máximo disponible: 2 unidades');
    });

    // CP-CR-06
    test('Given requestedQty=1 and availableStock=5, When validateStockLimit is called, Then it does not throw', () => {
      // Arrange
      const requestedQty = 1;
      const availableStock = 5;

      // Act & Assert
      expect(() => validateStockLimit(requestedQty, availableStock)).not.toThrow();
    });

    // CP-CR-07
    test('Given an empty cart and a product, When addItemToCart is called, Then the item is added correctly', () => {
      // Arrange
      const cart = [];
      const product = { id: 'p1', name: 'Laptop', price: 1500 };
      const qty = 1;
      const availableStock = 10;

      // Act
      const result = addItemToCart(cart, product, qty, availableStock);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'p1', name: 'Laptop', price: 1500, qty: 1 });
    });

    // CP-CR-08
    test('Given a cart with 2 items, When removeItemFromCart is called, Then the correct item is removed', () => {
      // Arrange
      const cart = [
        { id: 'p1', name: 'Laptop', price: 1500, qty: 1 },
        { id: 'p2', name: 'Phone',  price: 800,  qty: 2 },
      ];

      // Act
      const result = removeItemFromCart(cart, 'p1');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');
    });

    // CP-CR-09
    test('Given a cart with an item, When updateItemQuantity is called, Then the subtotal is recalculated correctly', () => {
      // Arrange
      const cart = [{ id: 'p1', name: 'Laptop', price: 1500, qty: 1 }];
      const newQty = 3;
      const availableStock = 10;

      // Act
      const updatedCart = updateItemQuantity(cart, 'p1', newQty, availableStock);
      const subtotal = calculateSubtotal(updatedCart);

      // Assert
      expect(updatedCart[0].qty).toBe(3);
      expect(subtotal).toBe(4500);
    });

    // Extra: addItemToCart with existing item accumulates qty
    test('Given a cart with an existing item, When addItemToCart is called again, Then qty accumulates', () => {
      // Arrange
      const cart = [{ id: 'p1', name: 'Laptop', price: 1500, qty: 1 }];
      const product = { id: 'p1', name: 'Laptop', price: 1500 };

      // Act
      const result = addItemToCart(cart, product, 2, 10);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].qty).toBe(3);
    });

    // Extra: validateStockLimit throws StockError instance
    test('Given requestedQty > availableStock, When validateStockLimit is called, Then it throws a StockError instance', () => {
      // Arrange & Act & Assert
      expect(() => validateStockLimit(10, 5)).toThrow(StockError);
    });
  });
});
