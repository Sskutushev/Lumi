import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';
import './i18n/config';
import { initSentry } from './lib/monitoring/sentryConfig';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query/queryClient.ts';

// Инициализация Sentry для мониторинга ошибок
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);
