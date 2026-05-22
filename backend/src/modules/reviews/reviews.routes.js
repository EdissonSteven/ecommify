'use strict';

const { Router } = require('express');
const controller = require('./reviews.controller');

const router = Router();

router.post('/', controller.createReview);
router.get('/product/:productId', controller.getProductReviews);

module.exports = router;
