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

// v2.4.0: Daily schedule for rhythm tracking
export interface DailySchedule {
  sleep: { start: number; end: number }; // 0-24 hours (24-hour format)
  work: { start: number; end: number } | null; // Optional work hours
  busy: { start: number; end: number }[]; // Additional busy periods
}

// v2.7.0: Multi-timezone alarm system
export interface Alarm {
  id: string; // Unique identifier (UUID)
  label: string; // e.g., "Wake up Alex ❤️"

  // Timezone reference: which person's timezone to use
  timeZoneReference: 'my' | 'partner'; // Use my timezone or partner's timezone

  // Time set in the REFERENCE timezone
  hour: number; // 0-23 (24-hour format)
  minute: number; // 0-59

  enabled: boolean; // Is alarm active

  // Repeat pattern
  repeatDays: number[]; // 0-6 (0=Sunday, 1=Monday, ..., 6=Saturday), empty array = one-time alarm

  // Notification settings
  sound: string; // Notification sound identifier (default: 'default')
  vibrate: boolean; // Enable vibration

  // Metadata
  createdAt: string; // ISO date string
  notificationId?: string; // Expo notification ID for scheduled notification
}
