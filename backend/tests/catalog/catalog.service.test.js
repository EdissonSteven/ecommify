'use strict';

const {
  filterProductsByPrice,
  filterProductsByCategory,
  filterProductsByMinRating,
  applyAllFilters,
  isProductAvailable,
  formatProductSummary,
} = require('../../src/modules/catalog/catalog.service');

const sampleProducts = [
  { id: 1, name: 'Laptop A', price: 1500, category: 'laptops', rating: 4.5, stock: 10 },
  { id: 2, name: 'Phone B',  price: 800,  category: 'phones',  rating: 3.8, stock: 0  },
  { id: 3, name: 'Tablet C', price: 600,  category: 'tablets', rating: 4.2, stock: 5  },
  { id: 4, name: 'Laptop D', price: 2000, category: 'laptops', rating: 4.8, stock: 3  },
  { id: 5, name: 'Phone E',  price: 400,  category: 'phones',  rating: 3.0, stock: 8  },
];

describe('CatalogService', () => {

  describe('HU-03: Búsqueda de productos', () => {

    // CP-CT-01
    test('Given products and a price range, When filterProductsByPrice is called, Then it returns products within the range', () => {
      // Arrange
      const minPrice = 500;
      const maxPrice = 1000;

      // Act
      const result = filterProductsByPrice(sampleProducts, minPrice, maxPrice);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(p => p.price >= 500 && p.price <= 1000)).toBe(true);
    });

    // CP-CT-02
    test('Given products and a narrow price range, When filterProductsByPrice is called, Then products outside the range are excluded', () => {
      // Arrange
      const minPrice = 1000;
      const maxPrice = 1600; // Laptop A ($1500) is in range; Laptop D ($2000) is excluded

      // Act
      const result = filterProductsByPrice(sampleProducts, minPrice, maxPrice);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    // CP-CT-03
    test('Given products and a category, When filterProductsByCategory is called, Then it returns only products from that category', () => {
      // Arrange
      const category = 'laptops';

      // Act
      const result = filterProductsByCategory(sampleProducts, category);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'laptops')).toBe(true);
    });

    // CP-CT-04
    test('Given products and a minimum rating, When filterProductsByMinRating is called, Then it returns only products with rating >= minimum', () => {
      // Arrange
      const minRating = 4.2;

      // Act
      const result = filterProductsByMinRating(sampleProducts, minRating);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every(p => p.rating >= 4.2)).toBe(true);
    });

    // CP-CT-05
    test('Given products and combined filters, When applyAllFilters is called, Then it applies all 3 filters simultaneously', () => {
      // Arrange
      const filters = { category: 'laptops', minPrice: 1000, maxPrice: 3000, minRating: 4.0 };

      // Act
      const result = applyAllFilters(sampleProducts, filters);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'laptops' && p.price >= 1000 && p.rating >= 4.0)).toBe(true);
    });

    // Extra: applyAllFilters with no filters returns all products
    test('Given products and no filters, When applyAllFilters is called, Then it returns all products', () => {
      // Arrange & Act
      const result = applyAllFilters(sampleProducts, {});

      // Assert
      expect(result).toHaveLength(sampleProducts.length);
    });
  });

  describe('HU-04: Detalle de producto', () => {

    // CP-CT-06
    test('Given a product with stock 0, When isProductAvailable is called, Then it returns false', () => {
      // Arrange
      const outOfStockProduct = { stock: 0 };

      // Act
      const result = isProductAvailable(outOfStockProduct);

      // Assert
      expect(result).toBe(false);
    });

    // CP-CT-07
    test('Given a product with stock 5, When isProductAvailable is called, Then it returns true', () => {
      // Arrange
      const availableProduct = { stock: 5 };

      // Act
      const result = isProductAvailable(availableProduct);

      // Assert
      expect(result).toBe(true);
    });

    // CP-CT-08
    test('Given a product object, When formatProductSummary is called, Then it returns the required fields', () => {
      // Arrange
      const product = { id: 1, name: 'Laptop A', price: 1500, stock: 10, rating: 4.5, description: 'ignore me' };

      // Act
      const result = formatProductSummary(product);

      // Assert
      expect(result).toEqual({ id: 1, name: 'Laptop A', price: 1500, stock: 10, rating: 4.5 });
      expect(result).not.toHaveProperty('description');
    });
  });
});
