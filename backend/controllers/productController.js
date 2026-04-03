/**
 * Product controller for Shopify-backed product listing routes.
 */
const { fetchProducts } = require('../services/shopifyService');

exports.listProducts = async (req, res, next) => {
  try {
    const products = await fetchProducts(req.shopId);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};
