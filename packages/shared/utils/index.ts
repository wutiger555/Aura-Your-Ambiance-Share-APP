import { LocationData } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth.
 * @param loc1 - The first location with latitude and longitude.
 * @param loc2 - The second location with latitude and longitude.
 * @returns The distance in kilometers.
 */
export function calculateDistance(loc1: LocationData, loc2: LocationData): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(loc2.latitude - loc1.latitude);
  const dLon = deg2rad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.latitude)) * Math.cos(deg2rad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the time difference in hours between two IANA timezones robustly.
 * Uses Intl.DateTimeFormat which works reliably in both web and React Native.
 * @param tz1 - The first timezone string (e.g., 'America/New_York').
 * @param tz2 - The second timezone string (e.g., 'Asia/Tokyo').
 * @returns The time difference in hours (tz2 - tz1).
 */
export function calculateTimeDifference(tz1: string, tz2: string): number {
    try {
        const now = new Date();

        // Function to get the UTC offset in minutes for a given timezone
        const getOffsetMinutes = (timeZone: string): number => {
            // Format the date to get timezone offset string (e.g., GMT-7)
            const offsetString = new Intl.DateTimeFormat('en-US', {
                timeZoneName: 'shortOffset',
                timeZone,
            }).format(now);

            // Extract the offset part, e.g., "GMT-7"
            const gmtPart = offsetString.split(' ')[1];
            const offsetParts = gmtPart.replace('GMT', '').split(':');
            const hours = parseInt(offsetParts[0], 10);
            const minutes = offsetParts.length > 1 ? parseInt(offsetParts[1], 10) : 0;

            return hours * 60 + (hours < 0 ? -minutes : minutes);
        };

        const offset1 = getOffsetMinutes(tz1);
        const offset2 = getOffsetMinutes(tz2);

        const diffMinutes = offset2 - offset1;
        const diffHours = diffMinutes / 60;

        return Math.round(diffHours * 2) / 2; // Return in 0.5 hour increments

    } catch (e) {
        console.error("Could not calculate time difference", e);
        return 0; // Return a neutral value on failure
    }
}

/**
 * Returns semantic time of day status string based on hour.
 * @param hour - The hour of the day (0-23).
 * @returns A status string like 'Resting', 'Morning', 'Daytime', 'Evening'.
 */
export function getSemanticTimeOfDay(hour: number): string {
  if (hour >= 23 || hour < 6) return 'Resting';
  if (hour >= 6 && hour < 9) return 'Morning';
  if (hour >= 9 && hour < 18) return 'Daytime';
  if (hour >= 18 && hour < 23) return 'Evening';
  return '';
}

export interface MagicHours {
  morningGoldenHour: [Date, Date];
  eveningGoldenHour: [Date, Date];
  morningBlueHour: [Date, Date];
  eveningBlueHour: [Date, Date];
}

const MINUTE = 60 * 1000;

export function calculateMagicHours(sunriseStr: string, sunsetStr: string): MagicHours {
  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);

  // Golden Hour approximation
  const morningGoldenHour: [Date, Date] = [
    new Date(sunrise.getTime() - 30 * MINUTE),
    new Date(sunrise.getTime() + 60 * MINUTE)
  ];
  const eveningGoldenHour: [Date, Date] = [
    new Date(sunset.getTime() - 60 * MINUTE),
    new Date(sunset.getTime() + 30 * MINUTE)
  ];

  // Blue Hour approximation
  const morningBlueHour: [Date, Date] = [
    new Date(sunrise.getTime() - 60 * MINUTE),
    new Date(sunrise.getTime() - 30 * MINUTE)
  ];
  const eveningBlueHour: [Date, Date] = [
    new Date(sunset.getTime() + 30 * MINUTE),
    new Date(sunset.getTime() + 60 * MINUTE)
  ];

  return { morningGoldenHour, eveningGoldenHour, morningBlueHour, eveningBlueHour };
}

/**
 * Get weather description text from weather code.
 * @param code - Weather code from Open-Meteo API
 * @returns Description string
 */
export function getWeatherDescription(code: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog',
    48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow',
    73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

/**
 * Determine weather category from code for gradient/styling purposes.
 */
export function getWeatherCategory(code: number): 'clear' | 'partlyCloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder' | 'default' {
  switch (code) {
    case 0: return 'clear';
    case 1: case 2: return 'partlyCloudy';
    case 3: return 'overcast';
    case 45: case 48: return 'fog';
    case 51: case 53: case 55: return 'drizzle';
    case 61: case 63: case 65: case 80: case 81: case 82: return 'rain';
    case 71: case 73: case 75: case 85: case 86: return 'snow';
    case 95: case 96: case 99: return 'thunder';
    default: return 'default';
  }
}
