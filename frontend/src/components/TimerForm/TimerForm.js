/**
 * TimerForm – reusable form for creating / editing a timer.
 * Uses Shopify Polaris components and validates required fields.
 */
import React, { useState } from 'react';
import {
  Card, FormLayout, TextField, Select, Button, InlineStack,
  BlockStack, Text, Checkbox, Banner, ColorPicker, hsbToHex, hexToHsb,
} from '@shopify/polaris';

const POSITION_OPTIONS = [
  { label: 'Top of page', value: 'top' },
  { label: 'Bottom of page', value: 'bottom' },
  { label: 'Inline (on product page)', value: 'inline' },
];

const TARGET_OPTIONS = [
  { label: 'All Products', value: 'all' },
  { label: 'Specific Products', value: 'specific_products' },
  { label: 'Specific Collections', value: 'specific_collections' },
];

const defaultValues = {
  name: '',
  timerType: 'fixed',
  startTime: '',
  endTime: '',
  evergreenDuration: 30,
  targeting: { type: 'all', productIds: [], collectionIds: [] },
  customization: {
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#FF4444',
    headingText: 'Hurry! Sale ends in:',
    expiredText: 'This offer has expired.',
    position: 'top',
    showUrgencyEffect: true,
  },
};

export default function TimerForm({ initialValues, onSubmit }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateCustom = (field, value) =>
    setForm((f) => ({ ...f, customization: { ...f.customization, [field]: value } }));
  const updateTargeting = (field, value) =>
    setForm((f) => ({ ...f, targeting: { ...f.targeting, [field]: value } }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Timer name is required';
    if (form.timerType === 'fixed') {
      if (!form.startTime) e.startTime = 'Start time is required';
      if (!form.endTime) e.endTime = 'End time is required';
      if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime))
        e.endTime = 'End time must be after start time';
    }
    if (form.timerType === 'evergreen' && (!form.evergreenDuration || form.evergreenDuration < 1))
      e.evergreenDuration = 'Duration must be at least 1 minute';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = { ...form };
    if (payload.timerType === 'evergreen') {
      delete payload.startTime;
      delete payload.endTime;
    } else {
      delete payload.evergreenDuration;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setErrors({ submit: err.response?.data?.errors?.join(', ') || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BlockStack gap="400">
      {errors.submit && <Banner tone="critical">{errors.submit}</Banner>}

      {/* Basic Info */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Timer Details</Text>
          <FormLayout>
            <TextField
              label="Timer Name"
              value={form.name}
              onChange={(v) => update('name', v)}
              error={errors.name}
              autoComplete="off"
            />
            <Select
              label="Timer Type"
              options={[
                { label: 'Fixed (Start & End Date)', value: 'fixed' },
                { label: 'Evergreen (Session-based)', value: 'evergreen' },
              ]}
              value={form.timerType}
              onChange={(v) => update('timerType', v)}
            />
            {form.timerType === 'fixed' && (
              <FormLayout.Group>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={form.startTime ? form.startTime.slice(0, 16) : ''}
                  onChange={(v) => update('startTime', v)}
                  error={errors.startTime}
                />
                <TextField
                  label="End Time"
                  type="datetime-local"
                  value={form.endTime ? form.endTime.slice(0, 16) : ''}
                  onChange={(v) => update('endTime', v)}
                  error={errors.endTime}
                />
              </FormLayout.Group>
            )}
            {form.timerType === 'evergreen' && (
              <TextField
                label="Duration (minutes)"
                type="number"
                value={String(form.evergreenDuration)}
                onChange={(v) => update('evergreenDuration', Number(v))}
                error={errors.evergreenDuration}
              />
            )}
          </FormLayout>
        </BlockStack>
      </Card>

      {/* Targeting */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Targeting</Text>
          <Select
            label="Show timer on"
            options={TARGET_OPTIONS}
            value={form.targeting.type}
            onChange={(v) => updateTargeting('type', v)}
          />
          {form.targeting.type === 'specific_products' && (
            <TextField
              label="Product IDs (comma-separated)"
              value={form.targeting.productIds.join(', ')}
              onChange={(v) => updateTargeting('productIds', v.split(',').map((s) => s.trim()).filter(Boolean))}
              helpText="In production, use Shopify Resource Picker here."
            />
          )}
          {form.targeting.type === 'specific_collections' && (
            <TextField
              label="Collection IDs (comma-separated)"
              value={form.targeting.collectionIds.join(', ')}
              onChange={(v) => updateTargeting('collectionIds', v.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          )}
        </BlockStack>
      </Card>

      {/* Customization */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Customization</Text>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Background Color"
                value={form.customization.backgroundColor}
                onChange={(v) => updateCustom('backgroundColor', v)}
                prefix={<span style={{ display: 'inline-block', width: 16, height: 16, background: form.customization.backgroundColor, borderRadius: 3, border: '1px solid #ccc' }} />}
              />
              <TextField
                label="Text Color"
                value={form.customization.textColor}
                onChange={(v) => updateCustom('textColor', v)}
                prefix={<span style={{ display: 'inline-block', width: 16, height: 16, background: form.customization.textColor, borderRadius: 3, border: '1px solid #ccc' }} />}
              />
              <TextField
                label="Accent Color"
                value={form.customization.accentColor}
                onChange={(v) => updateCustom('accentColor', v)}
              />
            </FormLayout.Group>
            <TextField
              label="Heading Text"
              value={form.customization.headingText}
              onChange={(v) => updateCustom('headingText', v)}
            />
            <TextField
              label="Expired Text"
              value={form.customization.expiredText}
              onChange={(v) => updateCustom('expiredText', v)}
            />
            <Select
              label="Position"
              options={POSITION_OPTIONS}
              value={form.customization.position}
              onChange={(v) => updateCustom('position', v)}
            />
            <Checkbox
              label="Show urgency effect when near expiry"
              checked={form.customization.showUrgencyEffect}
              onChange={(v) => updateCustom('showUrgencyEffect', v)}
            />
          </FormLayout>
        </BlockStack>
      </Card>

      <InlineStack align="end" gap="200">
        <Button variant="primary" onClick={handleSubmit} loading={submitting}>
          {initialValues ? 'Save Changes' : 'Create Timer'}
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
