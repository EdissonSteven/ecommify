'use strict';

/**
 * @param {number} stock
 * @returns {boolean}
 */
function validateStockValue(stock) {
  return Number.isInteger(stock) && stock >= 0;
}

/**
 * @param {number} stock
 * @returns {boolean}
 */
function isOutOfStock(stock) {
  return stock === 0;
}

/**
 * @param {number} currentStock
 * @param {number} newStock
 * @returns {{ updated: number, delta: number, isOutOfStock: boolean }}
 */
function applyStockUpdate(currentStock, newStock) {
  return {
    updated: newStock,
    delta: newStock - currentStock,
    isOutOfStock: newStock === 0,
  };
}

/**
 * @param {any} productId
 * @param {any} userId
 * @param {number} oldStock
 * @param {number} newStock
 * @returns {object}
 */
function buildStockHistoryEntry(productId, userId, oldStock, newStock) {
  return {
    productId,
    userId,
    oldStock,
    newStock,
    timestamp: new Date().toISOString(),
  };
}

/**
 * @param {any} sellerId
 * @param {{ sellerId: any }} product
 * @returns {boolean}
 */
function validateSellerOwnership(sellerId, product) {
  return product.sellerId === sellerId;
}

module.exports = {
  validateStockValue,
  isOutOfStock,
  applyStockUpdate,
  buildStockHistoryEntry,
  validateSellerOwnership,
};
