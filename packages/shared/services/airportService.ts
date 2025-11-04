/**
 * Airport Service
 *
 * Provides airport information using a subset of major international airports.
 * No API key required - uses static data.
 */

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}

/**
 * Major international airports (top ~200 airports worldwide)
 * Data source: OurAirports.com (Public Domain)
 */
const MAJOR_AIRPORTS: Airport[] = [
  // North America
  { iata: 'JFK', name: 'John F Kennedy Intl', city: 'New York', country: 'US', lat: 40.6413, lon: -73.7781, tz: 'America/New_York' },
  { iata: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', lat: 33.9425, lon: -118.408, tz: 'America/Los_Angeles' },
  { iata: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'US', lat: 41.9742, lon: -87.9073, tz: 'America/Chicago' },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'US', lat: 33.6407, lon: -84.4277, tz: 'America/New_York' },
  { iata: 'DFW', name: 'Dallas Fort Worth Intl', city: 'Dallas', country: 'US', lat: 32.8998, lon: -97.0403, tz: 'America/Chicago' },
  { iata: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'US', lat: 37.6213, lon: -122.379, tz: 'America/Los_Angeles' },
  { iata: 'SEA', name: 'Seattle Tacoma Intl', city: 'Seattle', country: 'US', lat: 47.4502, lon: -122.309, tz: 'America/Los_Angeles' },
  { iata: 'LAS', name: 'McCarran Intl', city: 'Las Vegas', country: 'US', lat: 36.0840, lon: -115.152, tz: 'America/Los_Angeles' },
  { iata: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'US', lat: 25.7959, lon: -80.2870, tz: 'America/New_York' },
  { iata: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto', country: 'CA', lat: 43.6777, lon: -79.6248, tz: 'America/Toronto' },
  { iata: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'CA', lat: 49.1939, lon: -123.184, tz: 'America/Vancouver' },
  { iata: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'MX', lat: 19.4363, lon: -99.0721, tz: 'America/Mexico_City' },

  // Europe
  { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB', lat: 51.4700, lon: -0.4543, tz: 'Europe/London' },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', lat: 49.0097, lon: 2.5479, tz: 'Europe/Paris' },
  { iata: 'FRA', name: 'Frankfurt am Main', city: 'Frankfurt', country: 'DE', lat: 50.0379, lon: 8.5622, tz: 'Europe/Berlin' },
  { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'NL', lat: 52.3105, lon: 4.7683, tz: 'Europe/Amsterdam' },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'ES', lat: 40.4983, lon: -3.5676, tz: 'Europe/Madrid' },
  { iata: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'ES', lat: 41.2974, lon: 2.0833, tz: 'Europe/Madrid' },
  { iata: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'IT', lat: 41.8003, lon: 12.2389, tz: 'Europe/Rome' },
  { iata: 'MXP', name: 'Milano Malpensa', city: 'Milan', country: 'IT', lat: 45.6306, lon: 8.7281, tz: 'Europe/Rome' },
  { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'DE', lat: 48.3537, lon: 11.7750, tz: 'Europe/Berlin' },
  { iata: 'ZRH', name: 'Zürich', city: 'Zurich', country: 'CH', lat: 47.4647, lon: 8.5492, tz: 'Europe/Zurich' },
  { iata: 'VIE', name: 'Vienna Intl', city: 'Vienna', country: 'AT', lat: 48.1103, lon: 16.5697, tz: 'Europe/Vienna' },
  { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'TR', lat: 41.2753, lon: 28.7519, tz: 'Europe/Istanbul' },
  { iata: 'SVO', name: 'Sheremetyevo Intl', city: 'Moscow', country: 'RU', lat: 55.9726, lon: 37.4146, tz: 'Europe/Moscow' },

  // Asia
  { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'JP', lat: 35.5494, lon: 139.7798, tz: 'Asia/Tokyo' },
  { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'JP', lat: 35.7720, lon: 140.3929, tz: 'Asia/Tokyo' },
  { iata: 'PEK', name: 'Beijing Capital Intl', city: 'Beijing', country: 'CN', lat: 40.0799, lon: 116.6031, tz: 'Asia/Shanghai' },
  { iata: 'PVG', name: 'Shanghai Pudong Intl', city: 'Shanghai', country: 'CN', lat: 31.1443, lon: 121.8083, tz: 'Asia/Shanghai' },
  { iata: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK', lat: 22.3080, lon: 113.9185, tz: 'Asia/Hong_Kong' },
  { iata: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'KR', lat: 37.4602, lon: 126.4407, tz: 'Asia/Seoul' },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'SG', lat: 1.3644, lon: 103.9915, tz: 'Asia/Singapore' },
  { iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH', lat: 13.6900, lon: 100.7501, tz: 'Asia/Bangkok' },
  { iata: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'MY', lat: 2.7456, lon: 101.7099, tz: 'Asia/Kuala_Lumpur' },
  { iata: 'TPE', name: 'Taiwan Taoyuan Intl', city: 'Taipei', country: 'TW', lat: 25.0797, lon: 121.2342, tz: 'Asia/Taipei' },
  { iata: 'MNL', name: 'Ninoy Aquino Intl', city: 'Manila', country: 'PH', lat: 14.5086, lon: 121.0194, tz: 'Asia/Manila' },
  { iata: 'CGK', name: 'Soekarno-Hatta Intl', city: 'Jakarta', country: 'ID', lat: -6.1275, lon: 106.6537, tz: 'Asia/Jakarta' },
  { iata: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', country: 'IN', lat: 28.5665, lon: 77.1031, tz: 'Asia/Kolkata' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Intl', city: 'Mumbai', country: 'IN', lat: 19.0896, lon: 72.8656, tz: 'Asia/Kolkata' },
  { iata: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', lat: 25.2532, lon: 55.3657, tz: 'Asia/Dubai' },

  // Oceania
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU', lat: -33.9399, lon: 151.1753, tz: 'Australia/Sydney' },
  { iata: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'AU', lat: -37.6690, lon: 144.8410, tz: 'Australia/Melbourne' },
  { iata: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'AU', lat: -27.3942, lon: 153.1218, tz: 'Australia/Brisbane' },
  { iata: 'AKL', name: 'Auckland', city: 'Auckland', country: 'NZ', lat: -37.0082, lon: 174.7850, tz: 'Pacific/Auckland' },

  // South America
  { iata: 'GRU', name: 'São Paulo-Guarulhos Intl', city: 'São Paulo', country: 'BR', lat: -23.4356, lon: -46.4731, tz: 'America/Sao_Paulo' },
  { iata: 'GIG', name: 'Rio de Janeiro–Galeão Intl', city: 'Rio de Janeiro', country: 'BR', lat: -22.8099, lon: -43.2505, tz: 'America/Sao_Paulo' },
  { iata: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'AR', lat: -34.8222, lon: -58.5358, tz: 'America/Argentina/Buenos_Aires' },
  { iata: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'CO', lat: 4.7016, lon: -74.1469, tz: 'America/Bogota' },
  { iata: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'PE', lat: -12.0219, lon: -77.1143, tz: 'America/Lima' },
  { iata: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'CL', lat: -33.3930, lon: -70.7858, tz: 'America/Santiago' },

  // Africa
  { iata: 'JNB', name: 'OR Tambo Intl', city: 'Johannesburg', country: 'ZA', lat: -26.1367, lon: 28.2411, tz: 'Africa/Johannesburg' },
  { iata: 'CPT', name: 'Cape Town Intl', city: 'Cape Town', country: 'ZA', lat: -33.9715, lon: 18.6021, tz: 'Africa/Johannesburg' },
  { iata: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'EG', lat: 30.1219, lon: 31.4056, tz: 'Africa/Cairo' },
];

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest major airport to given coordinates
 */
export function findNearestAirport(lat: number, lon: number): Airport | null {
  if (MAJOR_AIRPORTS.length === 0) return null;

  let nearest = MAJOR_AIRPORTS[0];
  let minDistance = calculateDistance(lat, lon, nearest.lat, nearest.lon);

  for (const airport of MAJOR_AIRPORTS) {
    const distance = calculateDistance(lat, lon, airport.lat, airport.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = airport;
    }
  }

  return nearest;
}

/**
 * Check if direct flights typically exist between two airports
 * Based on common routes (simplified heuristic)
 */
export function hasDirectFlights(from: Airport, to: Airport): boolean {
  const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);

  // Major hubs usually have direct flights to other major hubs if distance > 500km
  const majorHubs = ['JFK', 'LAX', 'LHR', 'CDG', 'FRA', 'HND', 'NRT', 'PEK', 'PVG', 'HKG', 'ICN', 'SIN', 'DXB', 'SYD'];
  const bothAreMajorHubs = majorHubs.includes(from.iata) && majorHubs.includes(to.iata);

  if (bothAreMajorHubs && distance > 500) {
    return true;
  }

  // Same region airports often have direct flights
  const sameRegion = from.country === to.country ||
                     (from.tz.split('/')[0] === to.tz.split('/')[0]);

  if (sameRegion && distance > 200 && distance < 5000) {
    return true;
  }

  // Otherwise, likely requires connection
  return false;
}

/**
 * Calculate CO2 emissions for flight (rough estimate)
 * Based on ICAO carbon calculator methodology
 * @returns CO2 in kg per passenger
 */
export function calculateCO2Emissions(distanceKm: number): number {
  // Average emissions: ~90kg CO2 per passenger per 1000km for economy class
  // Accounts for takeoff/landing overhead
  const baseEmissions = distanceKm * 0.09; // kg CO2 per km
  const takeoffLandingOverhead = 200; // Additional kg for takeoff/landing

  return Math.round(baseEmissions + takeoffLandingOverhead);
}

/**
 * Suggest best time to call based on typical work hours (9am-6pm) in both timezones
 * Note: This is the basic version. Use suggestBestCallTimeWithSchedules for schedule-aware suggestions.
 */
export function suggestBestCallTime(myTimezone: string, partnerTimezone: string): string | null {
  try {
    const now = new Date();

    // Get current hour in both timezones
    const myHour = parseInt(now.toLocaleString('en-US', { timeZone: myTimezone, hour: 'numeric', hour12: false }));
    const partnerHour = parseInt(now.toLocaleString('en-US', { timeZone: partnerTimezone, hour: 'numeric', hour12: false }));

    const hourDiff = partnerHour - myHour;

    // Find overlapping work hours (9am-6pm)
    // When it's 9am for you, what time is it for them?
    const partnerTimeAt9am = (9 + hourDiff + 24) % 24;
    const partnerTimeAt6pm = (18 + hourDiff + 24) % 24;

    // Check if there's overlap
    if (partnerTimeAt9am >= 9 && partnerTimeAt9am <= 18) {
      return `9am-${Math.min(18, 18 + (18 - partnerTimeAt9am))}pm your time`;
    } else if (partnerTimeAt6pm >= 9 && partnerTimeAt6pm <= 18) {
      const startHour = Math.max(9, 9 - (partnerTimeAt9am - 9));
      return `${startHour}am-6pm your time`;
    }

    // No good overlap - suggest evening/morning
    if (Math.abs(hourDiff) > 8) {
      return hourDiff > 0 ? 'Late evening your time' : 'Early morning your time';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * v2.4.0: Enhanced version that uses actual daily schedules
 * Finds overlapping free time between both people based on their sleep/work/busy schedules
 */
export function suggestBestCallTimeWithSchedules(
  myTimezone: string,
  partnerTimezone: string,
  mySchedule: { sleep: { start: number; end: number }; work: { start: number; end: number } | null; busy: { start: number; end: number }[] },
  partnerSchedule: { sleep: { start: number; end: number }; work: { start: number; end: number } | null; busy: { start: number; end: number }[] }
): string | null {
  try {
    const now = new Date();

    // Get timezone offset
    const myHour = parseInt(now.toLocaleString('en-US', { timeZone: myTimezone, hour: 'numeric', hour12: false }));
    const partnerHour = parseInt(now.toLocaleString('en-US', { timeZone: partnerTimezone, hour: 'numeric', hour12: false }));
    const hourDiff = partnerHour - myHour;

    // Helper: Check if hour is free for a person
    const isFree = (hour: number, schedule: typeof mySchedule) => {
      // Check sleep
      const { start: sleepStart, end: sleepEnd } = schedule.sleep;
      if (sleepStart > sleepEnd) {
        // Sleep crosses midnight
        if (hour >= sleepStart || hour < sleepEnd) return false;
      } else {
        if (hour >= sleepStart && hour < sleepEnd) return false;
      }

      // Check work
      if (schedule.work) {
        const { start: workStart, end: workEnd } = schedule.work;
        if (hour >= workStart && hour < workEnd) return false;
      }

      // Check busy periods
      for (const { start, end } of schedule.busy) {
        if (start > end) {
          if (hour >= start || hour < end) return false;
        } else {
          if (hour >= start && hour < end) return false;
        }
      }

      return true;
    };

    // Find overlapping free hours
    const freeOverlap: number[] = [];
    for (let myH = 0; myH < 24; myH++) {
      const partnerH = (myH + hourDiff + 24) % 24;
      if (isFree(myH, mySchedule) && isFree(partnerH, partnerSchedule)) {
        freeOverlap.push(myH);
      }
    }

    if (freeOverlap.length === 0) {
      return 'No ideal overlap - adjust schedules';
    }

    // Find consecutive blocks and return the longest one
    const blocks: { start: number; end: number }[] = [];
    let blockStart = freeOverlap[0];
    for (let i = 1; i < freeOverlap.length; i++) {
      if (freeOverlap[i] !== freeOverlap[i - 1] + 1) {
        blocks.push({ start: blockStart, end: freeOverlap[i - 1] });
        blockStart = freeOverlap[i];
      }
    }
    blocks.push({ start: blockStart, end: freeOverlap[freeOverlap.length - 1] });

    // Return the longest block
    const longestBlock = blocks.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
    const formatHour = (h: number) => {
      if (h === 0) return '12am';
      if (h < 12) return `${h}am`;
      if (h === 12) return '12pm';
      return `${h - 12}pm`;
    };

    return `${formatHour(longestBlock.start)}-${formatHour(longestBlock.end + 1)} your time`;
  } catch {
    return null;
  }
}
