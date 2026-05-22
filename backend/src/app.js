'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes      = require('./modules/auth/auth.routes');
const catalogRoutes   = require('./modules/catalog/catalog.routes');
const cartRoutes      = require('./modules/cart/cart.routes');
const checkoutRoutes  = require('./modules/checkout/checkout.routes');
const reviewsRoutes   = require('./modules/reviews/reviews.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.use('/api/auth',      authRoutes);
  app.use('/api/catalog',   catalogRoutes);
  app.use('/api/cart',      cartRoutes);
  app.use('/api/checkout',  checkoutRoutes);
  app.use('/api/reviews',   reviewsRoutes);
  app.use('/api/inventory', inventoryRoutes);

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  return app;
}

if (require.main === module) {
  const { connectMongo }          = require('./db/mongo');
  const { testPostgresConnection } = require('./db/postgres');
  const PORT = process.env.PORT || 3000;

  async function start() {
    console.log('🚀 Starting Ecommify API...');

    try {
      await Promise.all([
        connectMongo(),
        testPostgresConnection(),
      ]);
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    }

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`✅ Ecommify API running on port ${PORT}`);
    });
  }

  start();
}

module.exports = { createApp };
