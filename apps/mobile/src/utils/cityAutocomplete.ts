import { getCoordinatesForCity } from '@aura/shared';

/**
 * City Autocomplete Service
 * Uses OpenStreetMap Nominatim for city suggestions
 */

export interface CitySuggestion {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
}

/**
 * Search for city suggestions based on user input
 * Returns up to 5 suggestions
 */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Use Nominatim search API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `featuretype=city`,
      {
        headers: {
          'User-Agent': 'Aura-App/2.6.0',
        },
      }
    );

    if (!response.ok) {
      console.error('[CityAutocomplete] API error:', response.status);
      return [];
    }

    const data = await response.json();

    // Transform results to CitySuggestion format
    const suggestions: CitySuggestion[] = data
      .filter((item: any) => {
        // Only include cities, towns, villages
        const type = item.type;
        return (
          type === 'city' ||
          type === 'town' ||
          type === 'village' ||
          type === 'administrative'
        );
      })
      .map((item: any) => {
        const address = item.address || {};
        const rawCityName =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          item.name;

        // Clean city name: Nominatim sometimes returns multiple names separated by semicolons
        // (e.g., "伯克利;柏克萊" for different transliterations)
        // Take only the first name to avoid duplicates
        const cityName = rawCityName.split(';')[0].trim();

        return {
          name: cityName,
          displayName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: address.country || '',
        };
      });

    return suggestions;
  } catch (error) {
    console.error('[CityAutocomplete] Search failed:', error);
    return [];
  }
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
