import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ESGConfig } from '@/types';
import { useAuth } from './AuthContext';
import { api } from '@/services/api';

const defaultESGConfig: ESGConfig = {
  envWeight: 40,
  socialWeight: 30,
  govWeight: 30,
  autoEmissionCalc: true,
  evidenceRequired: true,
  badgeAutoAward: false
};

interface UIContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  config: ESGConfig;
  setConfig: (c: Partial<ESGConfig>) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [config, setConfigState] = useState<ESGConfig>(defaultESGConfig);

  // Fetch live config parameters from the database once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getESGConfig()
        .then((c) => {
          if (c) setConfigState(c);
        })
        .catch((err) => console.error('Failed to load live ESG configuration:', err));
    }
  }, [isAuthenticated]);

  function toggleSidebar() {
    setSidebarCollapsed((s) => !s);
  }

  function setConfig(c: Partial<ESGConfig>) {
    setConfigState((prev) => ({ ...prev, ...c }));
  }

  return (
    <UIContext.Provider value={{ sidebarCollapsed, toggleSidebar, config, setConfig }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
