import { LocationData } from "../types";

/**
 * Geocoding service using OpenStreetMap's Nominatim API (Free, no API key required)
 * Rate limit: 1 request per second (automatically handled with delays)
 */

// Simple rate limiter
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();
}

/**
 * Converts a city name to geographical coordinates
 * @param cityName - The name of the city to search for
 * @returns LocationData object with coordinates and official city name, or null if not found
 */
export async function getCoordinatesForCity(cityName: string): Promise<LocationData | null> {
    try {
        await waitForRateLimit();

        // Use Nominatim API to search for the city
        const searchUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
            q: cityName,
            format: 'json',
            limit: '1',
            addressdetails: '1'
        });

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Aura-App/1.0' // Nominatim requires a User-Agent
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        const result = data[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        // Extract the most appropriate city name
        let officialCityName = result.address?.city
            || result.address?.town
            || result.address?.village
            || result.address?.county
            || result.display_name.split(',')[0];

        // Clean up the city name
        officialCityName = officialCityName.trim();

        if (typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            !isNaN(latitude) &&
            !isNaN(longitude) &&
            officialCityName) {
            return {
                latitude,
                longitude,
                name: officialCityName
            };
        }

        return null;

    } catch (error) {
        console.error("Error fetching coordinates from Nominatim API:", error);
        return null;
    }
}

/**
 * Converts geographical coordinates to a city name
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns The name of the city, or null if not found
 */
export async function getCityForCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
        await waitForRateLimit();

        // Use Nominatim reverse geocoding API
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?` + new URLSearchParams({
            lat: latitude.toString(),
            lon: longitude.toString(),
            format: 'json',
            addressdetails: '1'
        });

        const response = await fetch(reverseUrl, {
            headers: {
                'User-Agent': 'Aura-App/1.0' // Nominatim requires a User-Agent
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.address) {
            return null;
        }

        // Extract the most appropriate city name
        const cityName = data.address.city
            || data.address.town
            || data.address.village
            || data.address.county
            || data.display_name.split(',')[0];

        return cityName ? cityName.trim() : null;

    } catch (error) {
        console.error("Error fetching city name from Nominatim API:", error);
        return null;
    }
}
