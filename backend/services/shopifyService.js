/**
 * Shopify service helpers for authenticated Admin API requests.
 * Uses the shop from the request or the configured store domain.
 */
const DEFAULT_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';
const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const PRODUCTS_QUERY = `#graphql
  query ProductsList($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          status
          vendor
          totalInventory
          featuredImage {
            url
            altText
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const createConfigError = (message) => {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
};

const resolveShopDomain = (requestedShop) => {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN || requestedShop;

  if (!shopDomain) {
    throw createConfigError(
      'Missing Shopify shop domain. Set SHOPIFY_STORE_DOMAIN or pass a valid x-shop-id header.',
    );
  }

  if (!SHOP_DOMAIN_REGEX.test(shopDomain)) {
    throw createConfigError('Invalid Shopify shop domain configuration.');
  }

  return shopDomain;
};

const normalizeProduct = (product) => ({
  id: product.id,
  legacyId: product.id.split('/').pop(),
  title: product.title,
  handle: product.handle,
  status: product.status,
  vendor: product.vendor,
  inventory: product.totalInventory || 0,
  image: product.featuredImage
    ? {
        url: product.featuredImage.url,
        altText: product.featuredImage.altText || product.title,
      }
    : null,
  price: product.priceRangeV2?.minVariantPrice
    ? {
        amount: Number(product.priceRangeV2.minVariantPrice.amount),
        currencyCode: product.priceRangeV2.minVariantPrice.currencyCode,
      }
    : null,
});

const fetchProducts = async (requestedShop, limit = 25) => {
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!accessToken) {
    throw createConfigError(
      'Missing SHOPIFY_ADMIN_ACCESS_TOKEN in backend configuration. Add your existing app token to load products.',
    );
  }

  const shopDomain = resolveShopDomain(requestedShop);
  const endpoint = `https://${shopDomain}/admin/api/${DEFAULT_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: PRODUCTS_QUERY,
      variables: { first: limit },
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    const message =
      payload.errors?.map((error) => error.message).join(', ') ||
      `Shopify Admin API request failed with status ${response.status}.`;
    const error = new Error(message);
    error.statusCode = response.status >= 400 && response.status < 500 ? 502 : response.status;
    throw error;
  }

  return payload.data.products.edges.map(({ node }) => normalizeProduct(node));
};

module.exports = { fetchProducts };
