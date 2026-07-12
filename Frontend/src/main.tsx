import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Suppress Recharts defaultProps console warnings
const originalError = console.error;
console.error = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Support for defaultProps will be removed')) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Support for defaultProps will be removed')) {
    return;
  }
  originalWarn(...args);
};

// Fallback to a dummy valid format key if placeholder or not defined, so the app runs out of the box in development
const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const PUBLISHABLE_KEY = (!rawKey || rawKey.includes('placeholder')) 
  ? 'pk_test_bGlrZS1maW5lLXdhcmYtNTEuY2xlcmsuYWNjb3VudHMuZGV2JA' 
  : rawKey;

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/login"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  </StrictMode>
);
