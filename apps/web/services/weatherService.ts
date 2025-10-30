import { WeatherData } from '../types';

const API_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,is_day,weather_code',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }

  const data = await response.json();
  return data as WeatherData;
}
