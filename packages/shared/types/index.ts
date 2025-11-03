export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  nickname?: string; // Optional custom nickname for the location

  // v2.5.0: Personalization enhancements
  displayName?: string;      // User's name (e.g., "Tzu-Hui")
  emoji?: string;            // Representative emoji (e.g., "🌸")
  statusMessage?: string;    // Custom status (e.g., "天氣很好～")
  citySymbol?: {
    emoji: string;
    tagline: string;
  };
}

export interface CoupleProfile {
  myName: string;
  partnerName: string;
  myEmoji?: string;
  partnerEmoji?: string;

  relationshipStart?: string; // ISO date string
  nextMeetingDate?: string;   // ISO date string
  lastMetDate?: string;        // ISO date string

  connectionName?: string; // e.g., "Our Red Thread"
}

export interface WeatherData {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    is_day: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

// v2.5.0: Message system for local notes
export interface Message {
  id: string;
  content: string;
  createdAt: string; // ISO date string
  isFromMe: boolean; // true if from user, false if viewing as partner's message
  emoji?: string;    // Optional emoji decoration
}
