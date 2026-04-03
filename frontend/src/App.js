/**
 * Root App component.
 * Wraps everything in Shopify Polaris AppProvider and sets up routing.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

import AppShell from './components/AppShell';
import AdminOverviewPage from './pages/AdminOverviewPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CreateTimerPage from './pages/CreateTimerPage';
import EditTimerPage from './pages/EditTimerPage';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="timers" element={<DashboardPage />} />
            <Route path="timers/new" element={<CreateTimerPage />} />
            <Route path="timers/:id/edit" element={<EditTimerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
