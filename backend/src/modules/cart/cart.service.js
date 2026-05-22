'use strict';

class StockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StockError';
  }
}

/**
 * @param {{ price: number, qty: number }[]} items
 * @returns {number}
 */
function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * @param {number} subtotal
 * @param {number} discountPercent  0-100
 * @returns {number} amount after discount
 */
function calculateDiscount(subtotal, discountPercent) {
  return subtotal * (1 - discountPercent / 100);
}

/**
 * @param {number} subtotal
 * @param {number} discount  already-discounted subtotal (result of calculateDiscount)
 * @param {number} taxRate   e.g. 0.19 for 19%
 * @returns {number}
 */
function calculateTotal(subtotal, discount, taxRate) {
  return discount * (1 + taxRate);
}

/**
 * Throws StockError when requested qty exceeds available stock.
 * @param {number} requestedQty
 * @param {number} availableStock
 */
function validateStockLimit(requestedQty, availableStock) {
  if (requestedQty > availableStock) {
    throw new StockError(`Stock máximo disponible: ${availableStock} unidades`);
  }
}

/**
 * @param {object[]} cart
 * @param {{ id: any, name: string, price: number }} product
 * @param {number} qty
 * @param {number} availableStock
 * @returns {object[]}
 */
function addItemToCart(cart, product, qty, availableStock) {
  validateStockLimit(qty, availableStock);
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    validateStockLimit(existing.qty + qty, availableStock);
    return cart.map(item =>
      item.id === product.id ? { ...item, qty: item.qty + qty } : item
    );
  }
  return [...cart, { id: product.id, name: product.name, price: product.price, qty }];
}

/**
 * @param {object[]} cart
 * @param {any} productId
 * @returns {object[]}
 */
function removeItemFromCart(cart, productId) {
  return cart.filter(item => item.id !== productId);
}

/**
 * @param {object[]} cart
 * @param {any} productId
 * @param {number} newQty
 * @param {number} availableStock
 * @returns {object[]}
 */
function updateItemQuantity(cart, productId, newQty, availableStock) {
  validateStockLimit(newQty, availableStock);
  return cart.map(item =>
    item.id === productId ? { ...item, qty: newQty } : item
  );
}

module.exports = {
  StockError,
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
  validateStockLimit,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
};
