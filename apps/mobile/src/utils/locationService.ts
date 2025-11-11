import * as Location from 'expo-location';
import { getCoordinatesForCity } from '@aura/shared';

export interface LocationResult {
  city: string;
  latitude: number;
  longitude: number;
}

export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  GEOCODING_FAILED = 'GEOCODING_FAILED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface LocationError {
  type: LocationErrorType;
  message: string;
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
 * With timeout to prevent hanging
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    // Add timeout to prevent hanging (10 seconds)
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 0,
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn('[LocationService] Location request timed out after 10s');
        resolve(null);
      }, 10000);
    });

    const location = await Promise.race([locationPromise, timeoutPromise]);
    return location;
  } catch (error) {
    console.error('[LocationService] Failed to get current location:', error);
    return null;
  }
}

/**
 * Reverse geocode: Convert coordinates to city name
 * Uses OpenStreetMap Nominatim API with retry logic
 */
export async function getCityFromCoordinates(
  latitude: number,
  longitude: number,
  retries: number = 2
): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Wait 1 second between attempts (Nominatim rate limit)
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[LocationService] Retry attempt ${attempt}/${retries}`);
      }

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
        if (response.status === 429 && attempt < retries) {
          // Rate limited, retry
          console.warn('[LocationService] Rate limited, retrying...');
          continue;
        }
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

      if (city) {
        return city;
      }

      // No city found, but request succeeded
      console.warn('[LocationService] No city found in reverse geocoding response');
      return null;
    } catch (error) {
      if (attempt === retries) {
        console.error('[LocationService] Reverse geocoding failed after retries:', error);
        return null;
      }
      // Continue to retry
      console.warn(`[LocationService] Reverse geocoding attempt ${attempt + 1} failed:`, error);
    }
  }

  return null;
}

/**
 * Auto-detect user's current city
 * Full flow: Request permission → Get location → Reverse geocode
 * Returns LocationResult on success, null on failure
 * Check console for detailed error information
 */
export async function autoDetectCity(): Promise<LocationResult | null> {
  try {
    // 1. Check and request permission if needed
    console.log('[LocationService] Checking location permission...');
    const permissionStatus = await getLocationPermissionStatus();

    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
      console.log('[LocationService] Permission not granted, requesting...');
      const newStatus = await requestLocationPermission();

      if (newStatus === Location.PermissionStatus.DENIED) {
        console.warn('[LocationService] Permission explicitly denied by user');
        return null;
      }

      if (newStatus !== Location.PermissionStatus.GRANTED) {
        console.warn('[LocationService] Permission not granted:', newStatus);
        return null;
      }

      console.log('[LocationService] Permission granted!');
    } else {
      console.log('[LocationService] Permission already granted');
    }

    // 2. Get current coordinates
    console.log('[LocationService] Getting current location...');
    const location = await getCurrentLocation();

    if (!location) {
      console.error('[LocationService] Failed to get coordinates (timeout or unavailable)');
      return null;
    }

    const { latitude, longitude } = location.coords;
    console.log('[LocationService] Got coordinates:', {
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4)
    });

    // 3. Reverse geocode to city name
    console.log('[LocationService] Reverse geocoding to city name...');
    const city = await getCityFromCoordinates(latitude, longitude);

    if (!city) {
      console.error('[LocationService] Reverse geocoding failed - could not determine city name');
      return null;
    }

    console.log('[LocationService] ✓ Successfully detected city:', city);

    return {
      city,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('[LocationService] Auto-detect failed with error:', error);
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
