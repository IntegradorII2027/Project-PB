import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthInitializer } from './components/AuthInitializer';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#F5F0E8',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#4ADE80', secondary: '#0E2A1A' } },
              error:   { iconTheme: { primary: '#F87171', secondary: '#2A0F0F' } },
            }}
          />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
