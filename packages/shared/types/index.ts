export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  nickname?: string; // Optional custom nickname for the location
}

export interface WeatherData {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    is_day: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}
