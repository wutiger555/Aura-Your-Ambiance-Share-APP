/**
 * Time formatting utilities
 * v2.6.6: Support for 24h/12h format switching
 */

/**
 * Format time string based on user preference
 * @param hours24 - Hour in 24-hour format (0-23)
 * @param minutes - Minutes (0-59)
 * @param format - '24h' or '12h'
 * @returns Formatted time string (e.g., "14:30" or "2:30 PM")
 */
export function formatTime(
  hours24: number,
  minutes: number,
  format: '24h' | '12h'
): string {
  if (format === '24h') {
    const h = hours24.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m}`;
  } else {
    // 12-hour format with AM/PM
    const period = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12; // Midnight (0) and Noon (12) should show as 12
    const m = minutes.toString().padStart(2, '0');
    return `${hours12}:${m} ${period}`;
  }
}

/**
 * Format time from Date object
 * @param date - Date object
 * @param format - '24h' or '12h'
 * @param timezone - IANA timezone (e.g., 'America/New_York')
 * @returns Formatted time string
 */
export function formatTimeFromDate(
  date: Date,
  format: '24h' | '12h',
  timezone?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format hour only (for timeline labels)
 * @param hours24 - Hour in 24-hour format (0-23)
 * @param format - '24h' or '12h'
 * @returns Formatted hour string (e.g., "14:00" or "2 PM")
 */
export function formatHour(hours24: number, format: '24h' | '12h'): string {
  if (format === '24h') {
    return `${hours24.toString().padStart(2, '0')}:00`;
  } else {
    const period = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    return `${hours12} ${period}`;
  }
}

/**
 * Parse time string in "HH:MM" format to hours and minutes
 * @param timeString - Time in "HH:MM" format (e.g., "14:30")
 * @returns Object with hours and minutes
 */
export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}
