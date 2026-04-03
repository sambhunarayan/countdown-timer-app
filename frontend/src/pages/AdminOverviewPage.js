import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
} from '@shopify/polaris';
import { fetchProducts, fetchTimers, SHOP_ID } from '../services/api';

const metricCardStyle = { minHeight: 126 };

const MetricCard = ({ label, value, helpText }) => (
  <Card>
    <div style={metricCardStyle}>
      <BlockStack gap="200" align="space-between">
        <Text as="p" tone="subdued">
          {label}
        </Text>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
        <Text as="p" tone="subdued">
          {helpText}
        </Text>
      </BlockStack>
    </div>
  </Card>
);

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState([]);
  const [products, setProducts] = useState([]);
  const [timerError, setTimerError] = useState(null);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);

      const [timerResult, productResult] = await Promise.allSettled([fetchTimers(), fetchProducts()]);

      if (timerResult.status === 'fulfilled') {
        setTimers(timerResult.value);
        setTimerError(null);
      } else {
        setTimerError('Unable to load timer analytics for this shop.');
      }

      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value);
        setProductError(null);
      } else {
        setProductError(
          productResult.reason?.response?.data?.error ||
            'Unable to load Shopify products. Check the backend Shopify token.',
        );
      }

      setLoading(false);
    };

    loadOverview();
  }, []);

  const activeTimers = timers.filter((timer) => timer.status === 'active').length;
  const totalImpressions = timers.reduce((sum, timer) => sum + (timer.impressions || 0), 0);

  if (loading) {
    return (
      <Page title="Admin">
        <Spinner />
      </Page>
    );
  }

  return (
    <Page
      title="Admin"
      subtitle="Manage products, timers, and your Shopify app setup from one place."
      primaryAction={{ content: 'View products', onAction: () => navigate('/products') }}
      secondaryActions={[{ content: 'Manage timers', onAction: () => navigate('/timers') }]}
    >
      <Layout>
        {(timerError || productError) && (
          <Layout.Section>
            <BlockStack gap="300">
              {timerError && <Banner tone="warning">{timerError}</Banner>}
              {productError && <Banner tone="critical">{productError}</Banner>}
            </BlockStack>
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineGrid columns={{ xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }} gap="400">
            <MetricCard
              label="Connected shop"
              value={SHOP_ID.replace('.myshopify.com', '')}
              helpText="Sent in the x-shop-id header from the React app."
            />
            <MetricCard
              label="Products loaded"
              value={products.length}
              helpText="Pulled from the Shopify Admin API."
            />
            <MetricCard
              label="Active timers"
              value={activeTimers}
              helpText="Currently running timers in the app."
            />
            <MetricCard
              label="Impressions"
              value={totalImpressions.toLocaleString()}
              helpText="Combined impressions across all timers."
            />
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Quick actions
              </Text>
              <InlineStack gap="300" wrap>
                <Button variant="primary" onClick={() => navigate('/products')}>
                  Open products
                </Button>
                <Button onClick={() => navigate('/timers')}>Open timers</Button>
                <Button onClick={() => navigate('/timers/new')}>Create timer</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Shopify connection
              </Text>
              <Text as="p" tone="subdued">
                The products route expects a valid <code>SHOPIFY_ADMIN_ACCESS_TOKEN</code> on the
                backend and uses the current shop header to resolve the store.
              </Text>
              <Text as="p" tone="subdued">
                If you are still seeing the demo shop, set <code>REACT_APP_SHOP_ID</code> in the
                frontend environment to your installed store domain.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                What changed
              </Text>
              <Text as="p" tone="subdued">
                <code>/</code> is now the admin overview, <code>/products</code> lists Shopify
                products, and the previous timer dashboard now lives at <code>/timers</code>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
