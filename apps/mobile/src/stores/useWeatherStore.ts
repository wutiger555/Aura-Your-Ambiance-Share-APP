import { create } from 'zustand';
import { WeatherData } from '@aura/shared';

interface WeatherStore {
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  setMyWeather: (weather: WeatherData) => void;
  setPartnerWeather: (weather: WeatherData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  myWeather: null,
  partnerWeather: null,
  isLoading: false,
  error: null,
  setMyWeather: (weather) => set({ myWeather: weather }),
  setPartnerWeather: (weather) => set({ partnerWeather: weather }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearWeather: () => set({ myWeather: null, partnerWeather: null, error: null }),
}));
