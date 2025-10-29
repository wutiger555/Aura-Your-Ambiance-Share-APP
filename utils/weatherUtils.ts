import React from 'react';
import { Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, Cloudy, Snowflake, Zap, CloudFog, CloudDrizzle } from 'lucide-react';

export interface Atmosphere {
  gradient: string;
  icon: React.ReactNode;
  description: string;
  animationClass: string;
}

export const getWeatherAtmosphere = (code: number, isDay: boolean, distance: number | null = null): Atmosphere => {
  const descriptions: { [key: number]: string } = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog',
    48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow',
    73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };

  const description = descriptions[code] || 'Unknown';
  const isDistant = distance !== null && distance > 5000; // 5000km threshold for "distant"

  // Day Gradients
  const dayGradients = {
      clear: 'from-sky-400 to-blue-600',
      partlyCloudy: 'from-sky-500 to-indigo-600',
      overcast: 'from-slate-500 to-slate-700',
      fog: 'from-slate-400 to-gray-500',
      drizzle: 'from-sky-600 to-slate-700',
      rain: 'from-slate-600 to-gray-800',
      snow: 'from-sky-200 to-slate-400',
      thunder: 'from-slate-800 to-black',
      default: 'from-gray-500 to-gray-700',
  };
  
  // Cooler "Distant" Day Gradients
  const distantDayGradients = {
      clear: 'from-sky-300 to-indigo-500',
      partlyCloudy: 'from-sky-400 to-slate-600',
      overcast: 'from-slate-600 to-slate-800',
      fog: 'from-slate-500 to-gray-600',
      drizzle: 'from-sky-700 to-slate-800',
      rain: 'from-slate-700 to-gray-900',
      snow: 'from-sky-300 to-slate-500',
      thunder: 'from-slate-900 to-black',
      default: 'from-gray-600 to-gray-800',
  };

  // Night Gradients
  const nightGradients = {
      clear: 'from-slate-900 to-indigo-900',
      partlyCloudy: 'from-slate-800 to-indigo-900',
      overcast: 'from-slate-800 to-slate-900',
      fog: 'from-slate-700 to-gray-900',
      drizzle: 'from-indigo-900 to-slate-900',
      rain: 'from-slate-900 to-black',
      snow: 'from-slate-700 to-indigo-900',
      thunder: 'from-black to-indigo-900',
      default: 'from-gray-800 to-black',
  };

  if (isDay) {
    const palette = isDistant ? distantDayGradients : dayGradients;
    switch (code) {
      case 0: return { gradient: palette.clear, icon: React.createElement(Sun), description, animationClass: 'animate-spin-slow' };
      case 1: case 2: return { gradient: palette.partlyCloudy, icon: React.createElement(CloudSun), description, animationClass: 'animate-bobble' };
      case 3: return { gradient: palette.overcast, icon: React.createElement(Cloudy), description, animationClass: 'animate-bobble' };
      case 45: case 48: return { gradient: palette.fog, icon: React.createElement(CloudFog), description, animationClass: 'animate-bobble' };
      case 51: case 53: case 55: return { gradient: palette.drizzle, icon: React.createElement(CloudDrizzle), description, animationClass: 'animate-bobble' };
      case 61: case 63: case 65: case 80: case 81: case 82: return { gradient: palette.rain, icon: React.createElement(CloudRain), description, animationClass: 'animate-bobble' };
      case 71: case 73: case 75: case 85: case 86: return { gradient: palette.snow, icon: React.createElement(Snowflake), description, animationClass: 'animate-spin-very-slow' };
      case 95: case 96: case 99: return { gradient: palette.thunder, icon: React.createElement(Zap), description, animationClass: 'animate-pulse-strong' };
      default: return { gradient: palette.default, icon: React.createElement(Cloud), description, animationClass: 'animate-bobble' };
    }
  } else { // Night (distance has less visual impact at night, so we use one set)
    const palette = nightGradients;
    switch (code) {
      case 0: return { gradient: palette.clear, icon: React.createElement(Moon), description, animationClass: 'animate-bobble' };
      case 1: case 2: return { gradient: palette.partlyCloudy, icon: React.createElement(CloudMoon), description, animationClass: 'animate-bobble' };
      case 3: return { gradient: palette.overcast, icon: React.createElement(Cloudy), description, animationClass: 'animate-bobble' };
      case 45: case 48: return { gradient: palette.fog, icon: React.createElement(CloudFog), description, animationClass: 'animate-bobble' };
      case 51: case 53: case 55: return { gradient: palette.drizzle, icon: React.createElement(CloudDrizzle), description, animationClass: 'animate-bobble' };
      case 61: case 63: case 65: case 80: case 81: case 82: return { gradient: palette.rain, icon: React.createElement(CloudRain), description, animationClass: 'animate-bobble' };
      case 71: case 73: case 75: case 85: case 86: return { gradient: palette.snow, icon: React.createElement(Snowflake), description, animationClass: 'animate-spin-very-slow' };
      case 95: case 96: case 99: return { gradient: palette.thunder, icon: React.createElement(Zap), description, animationClass: 'animate-pulse-strong' };
      default: return { gradient: palette.default, icon: React.createElement(Cloud), description, animationClass: 'animate-bobble' };
    }
  }
};