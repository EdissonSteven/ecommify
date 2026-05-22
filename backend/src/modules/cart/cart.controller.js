'use strict';

const cartService = require('./cart.service');

const sessions = new Map();

function getCart(req, res) {
  const cart = sessions.get(req.params.userId) || [];
  const subtotal = cartService.calculateSubtotal(cart);
  return res.json({ cart, subtotal });
}

function addItem(req, res) {
  const { product, qty, availableStock } = req.body;
  const { userId } = req.params;
  let cart = sessions.get(userId) || [];

  try {
    cart = cartService.addItemToCart(cart, product, qty, availableStock);
    sessions.set(userId, cart);
    return res.json({ cart, subtotal: cartService.calculateSubtotal(cart) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

function removeItem(req, res) {
  const { userId, productId } = req.params;
  let cart = sessions.get(userId) || [];
  cart = cartService.removeItemFromCart(cart, productId);
  sessions.set(userId, cart);
  return res.json({ cart, subtotal: cartService.calculateSubtotal(cart) });
}

function updateItem(req, res) {
  const { userId, productId } = req.params;
  const { qty, availableStock } = req.body;
  let cart = sessions.get(userId) || [];

  try {
    cart = cartService.updateItemQuantity(cart, productId, qty, availableStock);
    sessions.set(userId, cart);
    return res.json({ cart, subtotal: cartService.calculateSubtotal(cart) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { getCart, addItem, removeItem, updateItem };
