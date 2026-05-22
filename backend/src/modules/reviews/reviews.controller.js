'use strict';

const reviewsService = require('./reviews.service');
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  score: Number,
  comment: String,
  createdAt: String,
});
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function createReview(req, res) {
  const { userId, productId, score, comment, purchaseHistory } = req.body;

  if (!reviewsService.validateReviewScore(score)) {
    return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
  }
  if (!reviewsService.canUserReview(userId, productId, purchaseHistory || [])) {
    return res.status(403).json({ error: 'User has not purchased this product' });
  }

  const existing = await Review.find({ userId, productId }).lean();
  if (reviewsService.hasExistingReview(userId, productId, existing)) {
    return res.status(409).json({ error: 'Review already exists for this product' });
  }

  const doc = reviewsService.buildReviewDocument(userId, productId, score, comment);
  try {
    const saved = await Review.create(doc);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ error: 'Could not save review' });
  }
}

async function getProductReviews(req, res) {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).lean();
    const average = reviewsService.calculateAverageRating(reviews);
    return res.json({ reviews, average });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createReview, getProductReviews };
