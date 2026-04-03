/**
 * Shopify product routes protected by shop auth middleware.
 */
const express = require('express');
const router = express.Router();
const { authShop } = require('../middleware/authShop');
const productController = require('../controllers/productController');

router.use(authShop);

router.get('/', productController.listProducts);

module.exports = router;
