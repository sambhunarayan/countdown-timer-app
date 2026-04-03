/**
 * AnalyticsSummary – shows key metrics cards at the top of the dashboard.
 */
import React from 'react';
import { InlineStack, Card, Text, BlockStack } from '@shopify/polaris';

export default function AnalyticsSummary({ timers }) {
  const total = timers.length;
  const active = timers.filter((t) => t.status === 'active').length;
  const scheduled = timers.filter((t) => t.status === 'scheduled').length;
  const expired = timers.filter((t) => t.status === 'expired').length;
  const totalImpressions = timers.reduce((sum, t) => sum + (t.impressions || 0), 0);

  const metrics = [
    { label: 'Total Timers', value: total },
    { label: 'Active', value: active },
    { label: 'Scheduled', value: scheduled },
    { label: 'Expired', value: expired },
    { label: 'Total Impressions', value: totalImpressions.toLocaleString() },
  ];

  return (
    <InlineStack gap="400" wrap>
      {metrics.map((m) => (
        <div key={m.label} style={{ flex: '1 1 150px' }}>
          <Card>
            <BlockStack gap="100" align="center">
              <Text variant="bodyMd" as="p" tone="subdued">{m.label}</Text>
              <Text variant="headingLg" as="p">{m.value}</Text>
            </BlockStack>
          </Card>
        </div>
      ))}
    </InlineStack>
  );
}
