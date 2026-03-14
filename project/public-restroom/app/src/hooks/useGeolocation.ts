import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, DEFAULT_LOCATION, type UserLocation } from '../utils/geolocation.ts';

interface GeolocationState {
  location: UserLocation;
  isLoading: boolean;
  error: string | null;
  isDefault: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    isLoading: true,
    error: null,
    isDefault: true,
  });

  const fetchLocation = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    getCurrentLocation()
      .then((loc) => {
        setState({
          location: loc,
          isLoading: false,
          error: null,
          isDefault: false,
        });
      })
      .catch((err) => {
        setState({
          location: DEFAULT_LOCATION,
          isLoading: false,
          error: err instanceof Error ? err.message : '위치를 가져올 수 없어요',
          isDefault: true,
        });
      });
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    ...state,
    refresh: fetchLocation,
  };
}
