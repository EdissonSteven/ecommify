'use strict';

const { Router } = require('express');
const controller = require('./checkout.controller');

const router = Router();

router.post('/orders', controller.createOrder);

module.exports = router;
