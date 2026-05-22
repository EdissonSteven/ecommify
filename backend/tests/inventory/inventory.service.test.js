'use strict';

const {
  validateStockValue,
  isOutOfStock,
  applyStockUpdate,
  buildStockHistoryEntry,
  validateSellerOwnership,
} = require('../../src/modules/inventory/inventory.service');

describe('InventoryService', () => {

  describe('HU-08: Gestión de inventario por vendedor', () => {

    // CP-PV-01
    test('Given a stock value of 10, When validateStockValue is called, Then it returns true', () => {
      // Arrange
      const stock = 10;

      // Act
      const result = validateStockValue(stock);

      // Assert
      expect(result).toBe(true);
    });

    // CP-PV-02
    test('Given a stock value of -1, When validateStockValue is called, Then it returns false', () => {
      // Arrange
      const stock = -1;

      // Act
      const result = validateStockValue(stock);

      // Assert
      expect(result).toBe(false);
    });

    // CP-PV-03
    test('Given a stock value of 0, When validateStockValue is called, Then it returns true (zero is valid)', () => {
      // Arrange
      const stock = 0;

      // Act
      const result = validateStockValue(stock);

      // Assert
      expect(result).toBe(true);
    });

    // Extra: non-integer stock value
    test('Given a non-integer stock value (1.5), When validateStockValue is called, Then it returns false', () => {
      // Arrange
      const stock = 1.5;

      // Act
      const result = validateStockValue(stock);

      // Assert
      expect(result).toBe(false);
    });

    // CP-PV-04
    test('Given stock is 0, When isOutOfStock is called, Then it returns true', () => {
      // Arrange
      const stock = 0;

      // Act
      const result = isOutOfStock(stock);

      // Assert
      expect(result).toBe(true);
    });

    // CP-PV-05
    test('Given stock is 1, When isOutOfStock is called, Then it returns false', () => {
      // Arrange
      const stock = 1;

      // Act
      const result = isOutOfStock(stock);

      // Assert
      expect(result).toBe(false);
    });

    // CP-PV-06
    test('Given currentStock=10 and newStock=25, When applyStockUpdate is called, Then it returns { updated: 25, delta: +15, isOutOfStock: false }', () => {
      // Arrange
      const currentStock = 10;
      const newStock = 25;

      // Act
      const result = applyStockUpdate(currentStock, newStock);

      // Assert
      expect(result).toEqual({ updated: 25, delta: 15, isOutOfStock: false });
    });

    // CP-PV-07
    test('Given currentStock=5 and newStock=0, When applyStockUpdate is called, Then it returns { updated: 0, delta: -5, isOutOfStock: true }', () => {
      // Arrange
      const currentStock = 5;
      const newStock = 0;

      // Act
      const result = applyStockUpdate(currentStock, newStock);

      // Assert
      expect(result).toEqual({ updated: 0, delta: -5, isOutOfStock: true });
    });

    // CP-PV-08
    test('Given product, user and stock values, When buildStockHistoryEntry is called, Then it returns an object with timestamp, userId, productId, oldStock, newStock', () => {
      // Arrange
      const productId = 'p1';
      const userId = 'u1';
      const oldStock = 10;
      const newStock = 25;

      // Act
      const entry = buildStockHistoryEntry(productId, userId, oldStock, newStock);

      // Assert
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toMatchObject({ productId: 'p1', userId: 'u1', oldStock: 10, newStock: 25 });
    });

    // CP-PV-09
    test('Given a seller who owns the product, When validateSellerOwnership is called, Then it returns true', () => {
      // Arrange
      const sellerId = 's1';
      const product = { id: 'p1', sellerId: 's1' };

      // Act
      const result = validateSellerOwnership(sellerId, product);

      // Assert
      expect(result).toBe(true);
    });

    // CP-PV-10
    test('Given a seller who does not own the product, When validateSellerOwnership is called, Then it returns false', () => {
      // Arrange
      const sellerId = 's2';
      const product = { id: 'p1', sellerId: 's1' };

      // Act
      const result = validateSellerOwnership(sellerId, product);

      // Assert
      expect(result).toBe(false);
    });
  });
});
