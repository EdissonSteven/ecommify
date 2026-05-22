'use strict';

/**
 * @param {number} score
 * @returns {boolean}
 */
function validateReviewScore(score) {
  return Number.isInteger(score) && score >= 1 && score <= 5;
}

/**
 * @param {any} userId
 * @param {any} productId
 * @param {{ userId: any, productId: any, status: string }[]} purchaseHistory
 * @returns {boolean}
 */
function canUserReview(userId, productId, purchaseHistory) {
  return purchaseHistory.some(
    purchase =>
      purchase.userId === userId &&
      purchase.productId === productId &&
      purchase.status === 'delivered'
  );
}

/**
 * @param {any} userId
 * @param {any} productId
 * @param {{ userId: any, productId: any }[]} reviews
 * @returns {boolean}
 */
function hasExistingReview(userId, productId, reviews) {
  return reviews.some(r => r.userId === userId && r.productId === productId);
}

/**
 * @param {{ score: number }[]} reviews
 * @returns {number}
 */
function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.score, 0);
  return parseFloat((sum / reviews.length).toFixed(2));
}

/**
 * @param {any} userId
 * @param {any} productId
 * @param {number} score
 * @param {string} comment
 * @returns {object}
 */
function buildReviewDocument(userId, productId, score, comment) {
  return {
    userId,
    productId,
    score,
    comment,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  validateReviewScore,
  canUserReview,
  hasExistingReview,
  calculateAverageRating,
  buildReviewDocument,
};
