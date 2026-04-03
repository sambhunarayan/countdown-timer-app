/**
 * Edit Timer Page – loads an existing timer and pre-fills the form.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page, Spinner } from '@shopify/polaris';
import TimerForm from '../components/TimerForm/TimerForm';
import { fetchTimer, updateTimer } from '../services/api';

export default function EditTimerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    fetchTimer(id).then(setTimer);
  }, [id]);

  const handleSubmit = async (data) => {
    await updateTimer(id, data);
    navigate('/');
  };

  if (!timer) return <Page title="Edit Timer"><Spinner /></Page>;

  return (
    <Page title="Edit Timer" backAction={{ onAction: () => navigate('/') }}>
      <TimerForm initialValues={timer} onSubmit={handleSubmit} />
    </Page>
  );
}
