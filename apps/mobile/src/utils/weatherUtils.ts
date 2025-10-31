// Simplified weather atmosphere utilities for mobile
// Based on web version but adapted for React Native

export interface Atmosphere {
  gradient: [string, string]; // Tuple of two colors
  description: string;
}

export const getWeatherAtmosphere = (
  code: number,
  isDay: boolean,
  distance: number | null = null
): Atmosphere => {
  const descriptions: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  const description = descriptions[code] || 'Unknown';
  const isDistant = distance !== null && distance > 5000; // 5000km threshold for "distant"

  // Day Gradients (RGB colors for React Native)
  const dayGradients: { [key: string]: [string, string] } = {
    clear: ['#38bdf8', '#2563eb'], // sky-400 to blue-600
    partlyCloudy: ['#0ea5e9', '#4f46e5'], // sky-500 to indigo-600
    overcast: ['#64748b', '#334155'], // slate-500 to slate-700
    fog: ['#94a3b8', '#6b7280'], // slate-400 to gray-500
    drizzle: ['#0284c7', '#334155'], // sky-600 to slate-700
    rain: ['#475569', '#1f2937'], // slate-600 to gray-800
    snow: ['#bae6fd', '#94a3b8'], // sky-200 to slate-400
    thunder: ['#1e293b', '#000000'], // slate-800 to black
    default: ['#6b7280', '#374151'], // gray-500 to gray-700
  };

  // Distant Day Gradients (cooler tones)
  const distantDayGradients: { [key: string]: [string, string] } = {
    clear: ['#7dd3fc', '#6366f1'], // sky-300 to indigo-500
    partlyCloudy: ['#38bdf8', '#475569'], // sky-400 to slate-600
    overcast: ['#475569', '#1e293b'], // slate-600 to slate-800
    fog: ['#64748b', '#4b5563'], // slate-500 to gray-600
    drizzle: ['#0369a1', '#1e293b'], // sky-700 to slate-800
    rain: ['#334155', '#111827'], // slate-700 to gray-900
    snow: ['#7dd3fc', '#64748b'], // sky-300 to slate-500
    thunder: ['#0f172a', '#000000'], // slate-900 to black
    default: ['#4b5563', '#1f2937'], // gray-600 to gray-800
  };

  // Night Gradients
  const nightGradients: { [key: string]: [string, string] } = {
    clear: ['#0f172a', '#312e81'], // slate-900 to indigo-900
    partlyCloudy: ['#1e293b', '#312e81'], // slate-800 to indigo-900
    overcast: ['#1e293b', '#0f172a'], // slate-800 to slate-900
    fog: ['#334155', '#111827'], // slate-700 to gray-900
    drizzle: ['#312e81', '#0f172a'], // indigo-900 to slate-900
    rain: ['#0f172a', '#000000'], // slate-900 to black
    snow: ['#334155', '#312e81'], // slate-700 to indigo-900
    thunder: ['#000000', '#312e81'], // black to indigo-900
    default: ['#1f2937', '#000000'], // gray-800 to black
  };

  if (isDay) {
    const palette = isDistant ? distantDayGradients : dayGradients;
    switch (code) {
      case 0:
        return { gradient: palette.clear, description };
      case 1:
      case 2:
        return { gradient: palette.partlyCloudy, description };
      case 3:
        return { gradient: palette.overcast, description };
      case 45:
      case 48:
        return { gradient: palette.fog, description };
      case 51:
      case 53:
      case 55:
        return { gradient: palette.drizzle, description };
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return { gradient: palette.rain, description };
      case 71:
      case 73:
      case 75:
      case 85:
      case 86:
        return { gradient: palette.snow, description };
      case 95:
      case 96:
      case 99:
        return { gradient: palette.thunder, description };
      default:
        return { gradient: palette.default, description };
    }
  } else {
    // Night
    const palette = nightGradients;
    switch (code) {
      case 0:
        return { gradient: palette.clear, description };
      case 1:
      case 2:
        return { gradient: palette.partlyCloudy, description };
      case 3:
        return { gradient: palette.overcast, description };
      case 45:
      case 48:
        return { gradient: palette.fog, description };
      case 51:
      case 53:
      case 55:
        return { gradient: palette.drizzle, description };
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return { gradient: palette.rain, description };
      case 71:
      case 73:
      case 75:
      case 85:
      case 86:
        return { gradient: palette.snow, description };
      case 95:
      case 96:
      case 99:
        return { gradient: palette.thunder, description };
      default:
        return { gradient: palette.default, description };
    }
  }
};
