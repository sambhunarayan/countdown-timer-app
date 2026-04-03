/**
 * Dashboard Page – shows all timers with status badges and analytics.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page, Layout, Card, DataTable, Badge, Button,
  EmptyState, Spinner, Banner, Text, InlineStack, BlockStack,
} from '@shopify/polaris';
import { fetchTimers, deleteTimer } from '../services/api';
import AnalyticsSummary from '../components/Analytics/AnalyticsSummary';

const statusBadgeMap = {
  active: 'success',
  scheduled: 'info',
  expired: 'critical',
};

export default function DashboardPage() {
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadTimers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTimers();
      setTimers(data);
    } catch (err) {
      setError('Failed to load timers. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTimers(); }, [loadTimers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timer?')) return;
    await deleteTimer(id);
    loadTimers();
  };

  const rows = timers.map((t) => [
    t.name,
    t.timerType === 'fixed' ? 'Fixed' : 'Evergreen',
    <Badge tone={statusBadgeMap[t.status] || 'default'}>{t.status}</Badge>,
    t.impressions.toLocaleString(),
    <InlineStack gap="200">
      <Button size="slim" onClick={() => navigate(`/timers/${t._id}/edit`)}>Edit</Button>
      <Button size="slim" tone="critical" onClick={() => handleDelete(t._id)}>Delete</Button>
    </InlineStack>,
  ]);

  if (loading) return <Page title="Dashboard"><Spinner /></Page>;

  return (
    <Page
      title="Countdown Timer + Analytics"
      primaryAction={{ content: 'Create Timer', onAction: () => navigate('/timers/new') }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical">{error}</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <AnalyticsSummary timers={timers} />
        </Layout.Section>

        <Layout.Section>
          {timers.length === 0 ? (
            <Card>
              <EmptyState
                heading="No timers yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                action={{ content: 'Create Timer', onAction: () => navigate('/timers/new') }}
              >
                <p>Create your first countdown timer to boost urgency and conversions.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">All Timers</Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'numeric', 'text']}
                  headings={['Name', 'Type', 'Status', 'Impressions', 'Actions']}
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
