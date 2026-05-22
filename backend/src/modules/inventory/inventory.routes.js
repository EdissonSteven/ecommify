'use strict';

const { Router } = require('express');
const controller = require('./inventory.controller');

const router = Router();

router.get('/seller/:sellerId', controller.getStock);
router.patch('/:productId', controller.updateStock);

module.exports = router;
