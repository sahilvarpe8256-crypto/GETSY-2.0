import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    try {
      return localStorage.getItem('getsy-location') || '';
    } catch {
      return '';
    }
  });

  const [coordinates, setCoordinates] = useState(() => {
    try {
      const saved = localStorage.getItem('getsy-coordinates');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Sync location text to localStorage
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

  // Sync coordinates to localStorage
  useEffect(() => {
    try {
      if (coordinates) {
        localStorage.setItem('getsy-coordinates', JSON.stringify(coordinates));
      } else {
        localStorage.removeItem('getsy-coordinates');
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [coordinates]);

  const setLocation = useCallback((newLoc, newCoords = null) => {
    setLocationState(newLoc);
    setLocationError(null);
    if (newCoords) {
      setCoordinates(newCoords);
    }
  }, []);

  /**
   * Request browser geolocation safely with fallback handling
   */
  const detectCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser.';
        setLocationError(err);
        reject(new Error(err));
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoordinates(coords);
          // Set user-friendly display string
          const detectedName = 'Current Location';
          setLocationState(detectedName);
          setIsLocating(false);
          resolve({ location: detectedName, coordinates: coords });
        },
        (error) => {
          setIsLocating(false);
          let message = 'Unable to retrieve location.';
          if (error.code === 1) {
            message = 'Location permission was denied. You can enter your city manually.';
          } else if (error.code === 2) {
            message = 'Location position is unavailable. Please choose your city manually.';
          } else if (error.code === 3) {
            message = 'Location request timed out. Please try again.';
          }
          setLocationError(message);
          reject(new Error(message));
        },
        { timeout: 9000, maximumAge: 60000 }
      );
    });
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        coordinates,
        setCoordinates,
        isLocating,
        locationError,
        detectCurrentLocation
      }}
    >
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
