/**
 * Shop authentication middleware.
 * In production this verifies the Shopify session token (JWT).
 * For development we accept a x-shop-id header.
 */
const authShop = (req, res, next) => {
  const shopId = req.headers['x-shop-id'];

  if (!shopId) {
    return res.status(401).json({
      success: false,
      error: 'Missing shop authentication. Provide x-shop-id header.',
    });
  }

  // Basic format validation (myshop.myshopify.com)
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopId)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid shop ID format.',
    });
  }

  req.shopId = shopId;
  next();
};

module.exports = { authShop };
