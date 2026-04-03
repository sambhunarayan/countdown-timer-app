import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Badge, BlockStack, Card, InlineStack, Tabs, Text } from '@shopify/polaris';

const navigationTabs = [
  { id: 'admin', content: 'Admin', path: '/' },
  { id: 'products', content: 'Products', path: '/products' },
  { id: 'timers', content: 'Timers', path: '/timers' },
];

const getSelectedTab = (pathname) => {
  if (pathname === '/') {
    return 0;
  }

  const index = navigationTabs.findIndex(
    (tab) => tab.path !== '/' && pathname.startsWith(tab.path),
  );
  return index >= 0 ? index : 0;
};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--p-color-bg-surface-secondary)',
        padding: '16px 16px 32px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center" gap="300">
                <BlockStack gap="100">
                  <Text as="h1" variant="headingLg">
                    Countdown Timer App
                  </Text>
                  <Text as="p" tone="subdued">
                    Polaris-powered admin routes for your Shopify app.
                  </Text>
                </BlockStack>
                <Badge tone="info">Shopify Admin</Badge>
              </InlineStack>

              <Tabs
                fitted
                tabs={navigationTabs}
                selected={getSelectedTab(location.pathname)}
                onSelect={(index) => navigate(navigationTabs[index].path)}
              />
            </BlockStack>
          </Card>

          <Outlet />
        </BlockStack>
      </div>
    </div>
  );
}
