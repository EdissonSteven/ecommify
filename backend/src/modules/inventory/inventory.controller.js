'use strict';

const inventoryService = require('./inventory.service');
const { pool } = require('../../db/postgres');

async function updateStock(req, res) {
  const { productId } = req.params;
  const { newStock, sellerId } = req.body;

  if (!inventoryService.validateStockValue(newStock)) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT stock, seller_id FROM products WHERE id = $1',
      [productId]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    if (!inventoryService.validateSellerOwnership(sellerId, { sellerId: product.seller_id })) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Forbidden: product does not belong to this seller' });
    }

    const update = inventoryService.applyStockUpdate(product.stock, newStock);
    const historyEntry = inventoryService.buildStockHistoryEntry(productId, sellerId, product.stock, newStock);

    // Actualiza el stock del producto
    await client.query('UPDATE products SET stock = $1 WHERE id = $2', [newStock, productId]);

    // Persiste el historial de cambio
    await client.query(
      `INSERT INTO stock_history (product_id, seller_id, old_stock, new_stock)
       VALUES ($1, $2, $3, $4)`,
      [historyEntry.productId, historyEntry.userId, historyEntry.oldStock, historyEntry.newStock]
    );

    await client.query('COMMIT');

    return res.json({ ...update, history: historyEntry });
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

async function getStock(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, stock FROM products WHERE seller_id = $1',
      [req.params.sellerId]
    );
    return res.json(result.rows.map(p => ({
      ...p,
      isOutOfStock: inventoryService.isOutOfStock(p.stock),
    })));
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { updateStock, getStock };
