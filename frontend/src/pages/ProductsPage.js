import React, { useEffect, useState } from 'react';
import {
  Banner,
  Badge,
  BlockStack,
  Card,
  DataTable,
  EmptyState,
  Layout,
  Page,
  Spinner,
  Text,
} from '@shopify/polaris';
import { fetchProducts, SHOP_ID } from '../services/api';

const statusToneMap = {
  ACTIVE: 'success',
  ARCHIVED: 'critical',
  DRAFT: 'attention',
};

const formatStatus = (status) => status.charAt(0) + status.slice(1).toLowerCase();

const formatPrice = (price) => {
  if (!price) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode || 'USD',
  }).format(price.amount);
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'Unable to load Shopify products. Check the shop domain and Admin API token.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const rows = products.map((product) => [
    <BlockStack gap="050">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {product.title}
      </Text>
      <Text as="span" tone="subdued">
        /{product.handle}
      </Text>
    </BlockStack>,
    product.vendor || '-',
    <Badge tone={statusToneMap[product.status] || 'info'}>{formatStatus(product.status)}</Badge>,
    formatPrice(product.price),
    product.inventory,
  ]);

  if (loading) {
    return (
      <Page title="Products">
        <Spinner />
      </Page>
    );
  }

  return (
    <Page
      title="Products"
      subtitle={`Latest products for ${SHOP_ID}`}
      primaryAction={{ content: 'Refresh', onAction: () => window.location.reload() }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical">{error}</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          {products.length === 0 ? (
            <Card>
              <EmptyState
                heading="No products found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Your Shopify connection worked, but this store did not return any products.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Product listing
                </Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'numeric']}
                  headings={['Product', 'Vendor', 'Status', 'Price', 'Inventory']}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
