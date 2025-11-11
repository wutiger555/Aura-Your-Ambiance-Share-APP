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

  // Day Gradients (RGB colors for React Native) - BRIGHTENED for strong contrast with night
  const dayGradients: { [key: string]: [string, string] } = {
    clear: ['#B0E2FF', '#4A90E2'], // Bright sky blue to azure - MUCH brighter
    partlyCloudy: ['#87CEEB', '#5B9BD5'], // Sky blue to soft blue
    overcast: ['#9CA3AF', '#6B7280'], // Light gray to medium gray
    fog: ['#D1D5DB', '#9CA3AF'], // Very light gray to light gray
    drizzle: ['#7DD3FC', '#64748B'], // Light sky blue to slate
    rain: ['#6B7280', '#475569'], // Medium gray to dark gray (but not too dark)
    snow: ['#E0F2FE', '#BAE6FD'], // Very light sky blue to light sky blue
    thunder: ['#475569', '#1E293B'], // Dark gray to very dark gray
    default: ['#93C5FD', '#60A5FA'], // Light blue to medium blue
  };

  // Distant Day Gradients (cooler tones) - BRIGHTENED
  const distantDayGradients: { [key: string]: [string, string] } = {
    clear: ['#A5D8FF', '#6B9BD5'], // Light blue to medium blue (cooler but still bright)
    partlyCloudy: ['#7DD3FC', '#6B7280'], // Sky blue to slate (brighter)
    overcast: ['#9CA3AF', '#64748B'], // Light gray to slate
    fog: ['#CBD5E1', '#94A3B8'], // Very light gray to light gray
    drizzle: ['#67B7D1', '#475569'], // Teal to slate
    rain: ['#64748B', '#334155'], // Slate to dark slate (lighter)
    snow: ['#BAE6FD', '#94A3B8'], // Very light blue to light gray
    thunder: ['#475569', '#1E293B'], // Dark gray to very dark gray
    default: ['#7DD3FC', '#64748B'], // Light blue to slate
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
