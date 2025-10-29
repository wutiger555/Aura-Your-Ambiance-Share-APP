import { LocationData } from '../types';
import React from 'react';
import { Moon, Sun, Coffee } from 'lucide-react';

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
 * @param tz1 - The first timezone string (e.g., 'America/New_York').
 * @param tz2 - The second timezone string (e.g., 'Asia/Tokyo').
 * @returns The time difference in hours (tz2 - tz1).
 */
export function calculateTimeDifference(tz1: string, tz2: string): number {
    try {
        const now = new Date();
        
        const getOffset = (timeZone: string) => {
            const date = new Date(now.toLocaleString('en-US', { timeZone }));
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            return date.getTime() - utcDate.getTime();
        };

        const offset1 = getOffset(tz1);
        const offset2 = getOffset(tz2);
        
        const diffHours = (offset2 - offset1) / (1000 * 60 * 60);

        // Handle cases crossing the international date line by normalizing
        if (diffHours > 12) return diffHours - 24;
        if (diffHours < -12) return diffHours + 24;
        return Math.round(diffHours);

    } catch (e) {
        console.error("Could not calculate time difference", e);
        return 0; // Return a neutral value on failure
    }
}

/**
 * Returns a semantic description of the time of day with an icon.
 * @param hour - The hour of the day (0-23).
 * @returns An object with a status string and a React icon node.
 */
export function getSemanticTimeOfDay(hour: number): { status: string; icon: React.ReactNode } {
  if (hour >= 23 || hour < 6) {
    return { status: 'Resting', icon: React.createElement(Moon, { className: 'w-4 h-4' }) };
  }
  if (hour >= 6 && hour < 9) {
    return { status: 'Morning', icon: React.createElement(Coffee, { className: 'w-4 h-4' }) };
  }
  if (hour >= 9 && hour < 18) {
    return { status: 'Daytime', icon: React.createElement(Sun, { className: 'w-4 h-4' }) };
  }
  if (hour >= 18 && hour < 23) {
    return { status: 'Evening', icon: React.createElement(Moon, { className: 'w-4 h-4' }) };
  }
  return { status: '', icon: null };
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