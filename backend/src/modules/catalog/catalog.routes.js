'use strict';

const { Router } = require('express');
const controller = require('./catalog.controller');

const router = Router();

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);

module.exports = router;
