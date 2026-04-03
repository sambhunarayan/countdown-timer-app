const { fetchProducts } = require('../services/shopifyService');

describe('shopifyService.fetchProducts', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  test('throws when the Shopify admin token is missing', async () => {
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    await expect(fetchProducts('demo-store.myshopify.com')).rejects.toThrow(
      'Missing SHOPIFY_ADMIN_ACCESS_TOKEN',
    );
  });

  test('normalizes Shopify GraphQL products', async () => {
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'shpat_test';

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          products: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/Product/12345',
                  title: 'Countdown Product',
                  handle: 'countdown-product',
                  status: 'ACTIVE',
                  vendor: 'Countdown',
                  totalInventory: 12,
                  featuredImage: {
                    url: 'https://example.com/image.png',
                    altText: 'Countdown Product',
                  },
                  priceRangeV2: {
                    minVariantPrice: {
                      amount: '19.99',
                      currencyCode: 'USD',
                    },
                  },
                },
              },
            ],
          },
        },
      }),
    });

    const products = await fetchProducts('demo-store.myshopify.com');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://demo-store.myshopify.com/admin/api/2025-10/graphql.json',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Shopify-Access-Token': 'shpat_test',
        }),
      }),
    );
    expect(products).toEqual([
      {
        id: 'gid://shopify/Product/12345',
        legacyId: '12345',
        title: 'Countdown Product',
        handle: 'countdown-product',
        status: 'ACTIVE',
        vendor: 'Countdown',
        inventory: 12,
        image: {
          url: 'https://example.com/image.png',
          altText: 'Countdown Product',
        },
        price: {
          amount: 19.99,
          currencyCode: 'USD',
        },
      },
    ]);
  });
});
