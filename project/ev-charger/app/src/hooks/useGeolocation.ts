import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, getNearestDistrict, type Position } from '../utils/geolocation';
import { getRegionFromCoords } from '../utils/area-codes';

interface GeolocationState {
  position: Position | null;
  regionName: string | null;
  displayLocation: string | null;
  areaCode: string;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    regionName: null,
    displayLocation: null,
    areaCode: '11',
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const fetchLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pos = await getCurrentPosition();
      const region = getRegionFromCoords(pos.lat, pos.lng);
      // 서울이면 구 단위로 표시
      const district = getNearestDistrict(pos.lat, pos.lng);
      const display = district ? `서울 ${district}` : region.name;
      setState({
        position: pos,
        regionName: region.name,
        displayLocation: display,
        areaCode: region.code,
        loading: false,
        error: null,
        permissionDenied: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '위치를 확인할 수 없어요';
      const denied = message.includes('권한');
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
        permissionDenied: denied,
      }));
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { ...state, refresh: fetchLocation };
}
