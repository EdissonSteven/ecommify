'use strict';

/**
 * @param {object[]} products
 * @param {number} minPrice
 * @param {number} maxPrice
 * @returns {object[]}
 */
function filterProductsByPrice(products, minPrice, maxPrice) {
  return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * @param {object[]} products
 * @param {string} category
 * @returns {object[]}
 */
function filterProductsByCategory(products, category) {
  return products.filter(p => p.category === category);
}

/**
 * @param {object[]} products
 * @param {number} minRating
 * @returns {object[]}
 */
function filterProductsByMinRating(products, minRating) {
  return products.filter(p => p.rating >= minRating);
}

/**
 * @param {object[]} products
 * @param {{ category?: string, minPrice?: number, maxPrice?: number, minRating?: number }} filters
 * @returns {object[]}
 */
function applyAllFilters(products, { category, minPrice, maxPrice, minRating } = {}) {
  let result = products;
  if (category !== undefined) result = filterProductsByCategory(result, category);
  if (minPrice !== undefined && maxPrice !== undefined) result = filterProductsByPrice(result, minPrice, maxPrice);
  if (minRating !== undefined) result = filterProductsByMinRating(result, minRating);
  return result;
}

/**
 * @param {{ stock: number }} product
 * @returns {boolean}
 */
function isProductAvailable(product) {
  return product.stock > 0;
}

/**
 * @param {{ id: any, name: string, price: number, stock: number, rating: number }} product
 * @returns {{ id: any, name: string, price: number, stock: number, rating: number }}
 */
function formatProductSummary(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    rating: product.rating,
  };
}

module.exports = {
  filterProductsByPrice,
  filterProductsByCategory,
  filterProductsByMinRating,
  applyAllFilters,
  isProductAvailable,
  formatProductSummary,
};
