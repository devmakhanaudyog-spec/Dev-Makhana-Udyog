import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config.js';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let mounted = true;
    let retryTimeout;

    const loadSettings = async () => {
      try {
        let res = await fetch(`${API_BASE_URL}/api/public/settings`);

        // Backward-compat fallback for older backend deployments
        if (res.status === 404) {
          res = await fetch(`${API_BASE_URL}/api/settings`);
        }
        
        // Handle rate limiting gracefully
        if (res.status === 429) {
          if (retryCount < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delayMs = Math.pow(2, retryCount) * 1000;
            console.warn(`Rate limited. Retrying settings in ${delayMs}ms...`);
            
            if (mounted) {
              retryTimeout = setTimeout(() => {
                if (mounted) {
                  setRetryCount(prev => prev + 1);
                  loadSettings();
                }
              }, delayMs);
            }
            return;
          } else {
            console.error('Settings load failed: Too many retries after rate limit');
            if (mounted) setSettings({});
            if (mounted) setLoading(false);
            return;
          }
        }
        
        if (!res.ok) throw new Error(`Failed to load settings: ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setSettings(data || {});
          setRetryCount(0); // Reset on success
        }
      } catch (err) {
        console.error('Settings load error:', err.message);
        if (mounted) setSettings({});
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadSettings();
    
    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [retryCount]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
