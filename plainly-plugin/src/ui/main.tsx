import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { GlobalProvider } from './components';

const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <GlobalProvider>
          <App />
        </GlobalProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
