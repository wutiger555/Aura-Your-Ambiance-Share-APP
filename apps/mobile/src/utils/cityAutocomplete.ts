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
        // (e.g., "旧金山;舊金山;三藩市" for San Francisco with multiple transliterations)
        // Strategy: Prefer English names, or shortest name if all non-English
        const cleanCityName = (name: string): string => {
          if (!name) return '';

          const names = name.split(';').map(n => n.trim()).filter(n => n.length > 0);
          if (names.length === 0) return '';
          if (names.length === 1) return names[0];

          // Prefer names without CJK characters (English names)
          const englishNames = names.filter(n => !/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(n));
          if (englishNames.length > 0) {
            return englishNames[0];
          }

          // If all are CJK, prefer the shortest (usually most common)
          return names.reduce((shortest, current) =>
            current.length < shortest.length ? current : shortest
          );
        };

        const cityName = cleanCityName(rawCityName);

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
