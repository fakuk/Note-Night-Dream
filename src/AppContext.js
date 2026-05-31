// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDreams, getPin } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dreams, setDreams]         = useState([]);
  const [pin, setPin]               = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading]       = useState(true);

  const refreshDreams = useCallback(async () => {
    const data = await getDreams();
    setDreams(data);
  }, []);

  useEffect(() => {
    (async () => {
      const storedPin = await getPin();
      setPin(storedPin);
      await refreshDreams();
      setLoading(false);
    })();
  }, []);

  return (
    <AppContext.Provider value={{
      dreams, setDreams, refreshDreams,
      pin, setPin,
      authenticated, setAuthenticated,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
