import * as Location from 'expo-location';
import { getCoordinatesForCity } from '@aura/shared';

export interface LocationResult {
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * Location Service for Aura
 * Handles automatic location detection and reverse geocoding
 */

/**
 * Request location permissions from user
 * Returns permission status
 */
export async function requestLocationPermission(): Promise<Location.PermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('[LocationService] Permission request failed:', error);
    return Location.PermissionStatus.DENIED;
  }
}

/**
 * Get current location permission status
 */
export async function getLocationPermissionStatus(): Promise<Location.PermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('[LocationService] Failed to get permission status:', error);
    return Location.PermissionStatus.UNDETERMINED;
  }
}

/**
 * Get user's current location (latitude/longitude)
 * Requires permission to be granted first
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return location;
  } catch (error) {
    console.error('[LocationService] Failed to get current location:', error);
    return null;
  }
}

/**
 * Reverse geocode: Convert coordinates to city name
 * Uses OpenStreetMap Nominatim API
 */
export async function getCityFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    // Use Nominatim reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Aura-App/2.6.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract city name from response
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      data.address?.county ||
      data.name ||
      null;

    return city;
  } catch (error) {
    console.error('[LocationService] Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Auto-detect user's current city
 * Full flow: Request permission → Get location → Reverse geocode
 */
export async function autoDetectCity(): Promise<LocationResult | null> {
  try {
    // 1. Check permission
    const permissionStatus = await getLocationPermissionStatus();

    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
      // Request permission
      const newStatus = await requestLocationPermission();
      if (newStatus !== Location.PermissionStatus.GRANTED) {
        console.log('[LocationService] Permission denied by user');
        return null;
      }
    }

    // 2. Get current coordinates
    const location = await getCurrentLocation();
    if (!location) {
      console.error('[LocationService] Failed to get coordinates');
      return null;
    }

    const { latitude, longitude } = location.coords;
    console.log('[LocationService] Coordinates:', { latitude, longitude });

    // 3. Reverse geocode to city name
    const city = await getCityFromCoordinates(latitude, longitude);
    if (!city) {
      console.error('[LocationService] Failed to reverse geocode');
      return null;
    }

    console.log('[LocationService] Detected city:', city);

    return {
      city,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('[LocationService] Auto-detect failed:', error);
    return null;
  }
}

/**
 * Check if user's location has changed significantly
 * Compares current location with saved location
 */
export async function hasLocationChanged(
  savedLatitude: number,
  savedLongitude: number,
  thresholdKm: number = 50
): Promise<boolean> {
  try {
    const current = await getCurrentLocation();
    if (!current) return false;

    const distance = calculateDistance(
      savedLatitude,
      savedLongitude,
      current.coords.latitude,
      current.coords.longitude
    );

    return distance > thresholdKm;
  } catch (error) {
    console.error('[LocationService] Location change check failed:', error);
    return false;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
