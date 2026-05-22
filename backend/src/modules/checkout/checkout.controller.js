'use strict';

const checkoutService = require('./checkout.service');
const { pool } = require('../../db/postgres');

async function createOrder(req, res) {
  const { cart, address, payment, inventory, userId } = req.body;

  const addrValidation = checkoutService.validateShippingAddress(address);
  if (!addrValidation.valid) {
    return res.status(400).json({ error: 'Invalid address', details: addrValidation.errors });
  }

  if (!checkoutService.validatePaymentMethod(payment)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  try {
    checkoutService.processStockDecrement(cart, inventory);
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }

  const summary = checkoutService.buildOrderSummary(cart, address, payment);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Orden principal
    await client.query(
      `INSERT INTO orders (order_id, customer_id, total, status, shipping_address, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [summary.orderId, userId || null, summary.total, 'pending',
       JSON.stringify(address), payment]
    );

    // Ítems de la orden
    for (const item of cart) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [summary.orderId, item.id, item.name, item.price, item.qty]
      );
    }

    // Registro de pago
    await client.query(
      `INSERT INTO payments (order_id, payment_type, amount, status)
       VALUES ($1, $2, $3, $4)`,
      [summary.orderId, payment, summary.total, 'approved']
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Could not persist order' });
  } finally {
    client.release();
  }

  return res.status(201).json(summary);
}

module.exports = { createOrder };
