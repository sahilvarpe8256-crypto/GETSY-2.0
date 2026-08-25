import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    try {
      return localStorage.getItem('getsy-location') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (location) {
        localStorage.setItem('getsy-location', location);
      } else {
        localStorage.removeItem('getsy-location');
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
