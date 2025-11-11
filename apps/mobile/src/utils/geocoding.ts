/**
 * Geocoding utilities for city search and coordinate lookups
 * v2.7.0: Using OpenStreetMap Nominatim API
 */

interface CitySuggestion {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Search for cities by name using Nominatim API
 * @param query - City name to search
 * @returns Array of city suggestions (deduplicated, English names only)
 */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    // Request more results to filter duplicates, force English with accept-language
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=15&featuretype=city&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aura-App/2.7.0',
        'Accept-Language': 'en', // Force English results
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    // Map and deduplicate by city name
    const cities = data.map((item: any) => ({
      name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
      country: item.address.country || 'Unknown',
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));

    // Deduplicate by city name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueCities = cities.filter((city: CitySuggestion) => {
      const key = `${city.name.toLowerCase()}, ${city.country.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Return max 5 unique results
    return uniqueCities.slice(0, 5);
  } catch (error) {
    console.error('[Geocoding] Search failed:', error);
    return [];
  }
}

/**
 * Get coordinates for a specific city name
 * @param cityName - Name of the city
 * @returns City coordinates
 */
export async function getCoordsForCity(cityName: string): Promise<CityCoordinates | null> {
  try {
    const results = await searchCities(cityName);
    if (results.length === 0) {
      return null;
    }

    return {
      name: results[0].name,
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  } catch (error) {
    console.error('[Geocoding] Failed to get coordinates:', error);
    return null;
  }
}

/**
 * Reverse geocoding: Get city name from coordinates
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns City name
 */
export async function getCityFromCoords(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aura-App/2.7.0',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    return data.address.city || data.address.town || data.address.village || data.display_name.split(',')[0];
  } catch (error) {
    console.error('[Geocoding] Reverse geocoding failed:', error);
    return null;
  }
}
