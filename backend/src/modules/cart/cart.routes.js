'use strict';

const { Router } = require('express');
const controller = require('./cart.controller');

const router = Router();

router.get('/:userId', controller.getCart);
router.post('/:userId/items', controller.addItem);
router.delete('/:userId/items/:productId', controller.removeItem);
router.patch('/:userId/items/:productId', controller.updateItem);

module.exports = router;
