'use strict';

const {
  validateReviewScore,
  canUserReview,
  hasExistingReview,
  calculateAverageRating,
  buildReviewDocument,
} = require('../../src/modules/reviews/reviews.service');

describe('ReviewsService', () => {

  describe('HU-07: Publicación de review de producto', () => {

    // CP-RV-01
    test('Given a score of 4, When validateReviewScore is called, Then it returns true', () => {
      // Arrange
      const score = 4;

      // Act
      const result = validateReviewScore(score);

      // Assert
      expect(result).toBe(true);
    });

    // CP-RV-02
    test('Given a score of 0, When validateReviewScore is called, Then it returns false', () => {
      // Arrange
      const score = 0;

      // Act
      const result = validateReviewScore(score);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-03
    test('Given a score of 6, When validateReviewScore is called, Then it returns false', () => {
      // Arrange
      const score = 6;

      // Act
      const result = validateReviewScore(score);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-04
    test('Given a score of 3.5 (not an integer), When validateReviewScore is called, Then it returns false', () => {
      // Arrange
      const score = 3.5;

      // Act
      const result = validateReviewScore(score);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-05
    test('Given empty purchase history, When canUserReview is called, Then it returns false', () => {
      // Arrange
      const userId = 'u1';
      const productId = 'p1';
      const purchaseHistory = [];

      // Act
      const result = canUserReview(userId, productId, purchaseHistory);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-06
    test('Given a confirmed purchase of the product, When canUserReview is called, Then it returns true', () => {
      // Arrange
      const userId = 'u1';
      const productId = 'p1';
      const purchaseHistory = [
        { userId: 'u1', productId: 'p1', status: 'delivered' },
      ];

      // Act
      const result = canUserReview(userId, productId, purchaseHistory);

      // Assert
      expect(result).toBe(true);
    });

    // Extra: canUserReview with purchase but not delivered
    test('Given a purchase with status "pending", When canUserReview is called, Then it returns false', () => {
      // Arrange
      const purchaseHistory = [{ userId: 'u1', productId: 'p1', status: 'pending' }];

      // Act
      const result = canUserReview('u1', 'p1', purchaseHistory);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-07
    test('Given an existing review for the same user and product, When hasExistingReview is called, Then it returns true', () => {
      // Arrange
      const userId = 'u1';
      const productId = 'p1';
      const reviews = [{ userId: 'u1', productId: 'p1', score: 5 }];

      // Act
      const result = hasExistingReview(userId, productId, reviews);

      // Assert
      expect(result).toBe(true);
    });

    // CP-RV-08
    test('Given no existing review for the user-product combination, When hasExistingReview is called, Then it returns false', () => {
      // Arrange
      const userId = 'u2';
      const productId = 'p1';
      const reviews = [{ userId: 'u1', productId: 'p1', score: 5 }];

      // Act
      const result = hasExistingReview(userId, productId, reviews);

      // Assert
      expect(result).toBe(false);
    });

    // CP-RV-09
    test('Given reviews with scores [5, 4, 3], When calculateAverageRating is called, Then it returns 4.00', () => {
      // Arrange
      const reviews = [{ score: 5 }, { score: 4 }, { score: 3 }];

      // Act
      const result = calculateAverageRating(reviews);

      // Assert
      expect(result).toBe(4.00);
    });

    // CP-RV-10
    test('Given an empty reviews array, When calculateAverageRating is called, Then it returns 0', () => {
      // Arrange
      const reviews = [];

      // Act
      const result = calculateAverageRating(reviews);

      // Assert
      expect(result).toBe(0);
    });

    // Extra: buildReviewDocument structure
    test('Given user, product, score and comment, When buildReviewDocument is called, Then it returns a complete document', () => {
      // Arrange
      const userId = 'u1';
      const productId = 'p1';
      const score = 5;
      const comment = 'Excelente producto';

      // Act
      const doc = buildReviewDocument(userId, productId, score, comment);

      // Assert
      expect(doc).toMatchObject({ userId: 'u1', productId: 'p1', score: 5, comment: 'Excelente producto' });
      expect(doc).toHaveProperty('createdAt');
    });
  });
});
