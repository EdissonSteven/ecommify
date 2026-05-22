'use strict';

const catalogService = require('./catalog.service');
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  rating: Number,
  stock: Number,
  description: String,
  sellerId: String,
  images: [String],
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function getProducts(req, res) {
  try {
    const { category, minPrice, maxPrice, minRating } = req.query;
    let products = await Product.find().lean();

    products = catalogService.applyAllFilters(products, {
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
    });

    return res.json(products.map(catalogService.formatProductSummary));
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    return res.json({
      ...catalogService.formatProductSummary(product),
      available: catalogService.isProductAvailable(product),
      description: product.description,
      images: product.images,
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getProducts, getProductById };
