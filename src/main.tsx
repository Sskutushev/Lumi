import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';
import './i18n/config';
import { initSentry } from './lib/monitoring/sentryConfig';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query/queryClient.ts';

// Initialize Sentry for error monitoring
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
