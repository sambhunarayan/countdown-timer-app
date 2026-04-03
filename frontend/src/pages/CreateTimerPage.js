/**
 * Create Timer Page – renders the TimerForm for creating a new timer.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@shopify/polaris';
import TimerForm from '../components/TimerForm/TimerForm';
import { createTimer } from '../services/api';

export default function CreateTimerPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createTimer(data);
    navigate('/timers');
  };

  return (
    <Page title="Create Timer" backAction={{ onAction: () => navigate('/timers') }}>
      <TimerForm onSubmit={handleSubmit} />
    </Page>
  );
}
