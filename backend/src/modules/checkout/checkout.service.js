'use strict';

const REQUIRED_ADDRESS_FIELDS = ['street', 'city', 'state', 'zipCode', 'country'];
const VALID_PAYMENT_METHODS = ['credit_card', 'boleto', 'debit_card'];

class InsufficientStockError extends Error {
  constructor(productId) {
    super(`Insufficient stock for product: ${productId}`);
    this.name = 'InsufficientStockError';
    this.productId = productId;
  }
}

/**
 * @param {object} address
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateShippingAddress(address) {
  const errors = [];
  for (const field of REQUIRED_ADDRESS_FIELDS) {
    if (!address || !address[field] || String(address[field]).trim() === '') {
      errors.push(`${field} required`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * @param {string} method
 * @returns {boolean}
 */
function validatePaymentMethod(method) {
  return VALID_PAYMENT_METHODS.includes(method);
}

/**
 * @returns {string}  e.g. 'ORD-A1B2C3D4'
 */
function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ORD-${suffix}`;
}

/**
 * @param {{ price: number, qty: number }[]} items
 * @param {number} shipping
 * @returns {number}
 */
function calculateOrderTotal(items, shipping) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return subtotal + shipping;
}

/**
 * Decrements stock for each item. Throws InsufficientStockError without mutating
 * inventory if any item exceeds available stock.
 * @param {{ id: any, qty: number }[]} items
 * @param {object} inventory  { [productId]: number }
 * @returns {object} updated inventory
 */
function processStockDecrement(items, inventory) {
  for (const item of items) {
    const available = inventory[item.id] ?? 0;
    if (item.qty > available) {
      throw new InsufficientStockError(item.id);
    }
  }
  const updated = { ...inventory };
  for (const item of items) {
    updated[item.id] = updated[item.id] - item.qty;
  }
  return updated;
}

/**
 * @param {object[]} cart
 * @param {object} address
 * @param {string} payment
 * @returns {{ orderId: string, total: number, items: object[], address: object, payment: string, createdAt: string }}
 */
function buildOrderSummary(cart, address, payment) {
  const total = calculateOrderTotal(cart, 0);
  return {
    orderId: generateOrderNumber(),
    total,
    items: cart,
    address,
    payment,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  InsufficientStockError,
  validateShippingAddress,
  validatePaymentMethod,
  generateOrderNumber,
  calculateOrderTotal,
  processStockDecrement,
  buildOrderSummary,
};
