import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { set as setTime, getDay } from 'date-fns';
import { Alarm } from '@aura/shared';

/**
 * Convert alarm time from reference timezone to local timezone
 * @param alarm - Alarm object with hour/minute in reference timezone
 * @param referenceTimezone - IANA timezone of the reference (my or partner's timezone)
 * @param localTimezone - IANA timezone of the local device
 * @returns Object with local hour, minute, and day offset
 */
export function convertAlarmTimeToLocal(
  alarm: Alarm,
  referenceTimezone: string,
  localTimezone: string
): { hour: number; minute: number; dayOffset: number } {
  // Create a date in the reference timezone with the alarm time
  const referenceDate = new Date();
  const alarmDateInReference = setTime(referenceDate, {
    hours: alarm.hour,
    minutes: alarm.minute,
    seconds: 0,
    milliseconds: 0,
  });

  // Convert to UTC, treating the time as being in the reference timezone
  const utcDate = fromZonedTime(alarmDateInReference, referenceTimezone);

  // Convert from UTC to local timezone
  const localDate = toZonedTime(utcDate, localTimezone);

  const hour = localDate.getHours();
  const minute = localDate.getMinutes();

  // Calculate day offset (if conversion crosses day boundary)
  const referenceDayOfWeek = getDay(alarmDateInReference);
  const localDayOfWeek = getDay(localDate);
  let dayOffset = localDayOfWeek - referenceDayOfWeek;

  // Handle wrap-around
  if (dayOffset < -3) dayOffset += 7;
  if (dayOffset > 3) dayOffset -= 7;

  return { hour, minute, dayOffset };
}

/**
 * Convert alarm time from local timezone to reference timezone
 * @param hour - Local hour (0-23)
 * @param minute - Local minute (0-59)
 * @param localTimezone - IANA timezone of the local device
 * @param referenceTimezone - IANA timezone of the reference
 * @returns Object with reference hour and minute
 */
export function convertAlarmTimeToReference(
  hour: number,
  minute: number,
  localTimezone: string,
  referenceTimezone: string
): { hour: number; minute: number } {
  // Create a date in the local timezone with the given time
  const localDate = new Date();
  const alarmDateInLocal = setTime(localDate, {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0,
  });

  // Convert to UTC, treating the time as being in the local timezone
  const utcDate = fromZonedTime(alarmDateInLocal, localTimezone);

  // Convert from UTC to reference timezone
  const referenceDate = toZonedTime(utcDate, referenceTimezone);

  return {
    hour: referenceDate.getHours(),
    minute: referenceDate.getMinutes(),
  };
}

/**
 * Format alarm time for display
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param use24Hour - Use 24-hour format (default: true)
 * @returns Formatted time string (e.g., "09:00" or "9:00 AM")
 */
export function formatAlarmTime(
  hour: number,
  minute: number,
  use24Hour: boolean = true
): string {
  if (use24Hour) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }
}

/**
 * Get display text for repeat days
 * @param repeatDays - Array of day numbers (0-6, 0=Sunday)
 * @returns Display text (e.g., "Every day", "Weekdays", "Mon, Wed, Fri")
 */
export function getRepeatDaysText(repeatDays: number[]): string {
  if (repeatDays.length === 0) {
    return 'One time';
  }

  if (repeatDays.length === 7) {
    return 'Every day';
  }

  // Check for weekdays (Mon-Fri)
  const weekdays = [1, 2, 3, 4, 5];
  if (
    repeatDays.length === 5 &&
    weekdays.every((day) => repeatDays.includes(day))
  ) {
    return 'Weekdays';
  }

  // Check for weekends (Sat-Sun)
  const weekends = [0, 6];
  if (
    repeatDays.length === 2 &&
    weekends.every((day) => repeatDays.includes(day))
  ) {
    return 'Weekends';
  }

  // Individual days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sortedDays = [...repeatDays].sort((a, b) => a - b);
  return sortedDays.map((day) => dayNames[day]).join(', ');
}

/**
 * Calculate next alarm trigger time
 * @param alarm - Alarm object
 * @param referenceTimezone - IANA timezone of the reference
 * @param localTimezone - IANA timezone of the local device
 * @returns Date object of next trigger time in local timezone, or null if one-time alarm in the past
 */
export function getNextAlarmTriggerTime(
  alarm: Alarm,
  referenceTimezone: string,
  localTimezone: string
): Date | null {
  const { hour, minute, dayOffset } = convertAlarmTimeToLocal(
    alarm,
    referenceTimezone,
    localTimezone
  );

  const now = new Date();
  const todayAlarmTime = setTime(now, {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0,
  });

  // One-time alarm
  if (alarm.repeatDays.length === 0) {
    return todayAlarmTime > now ? todayAlarmTime : null;
  }

  // Repeating alarm - find next occurrence
  const currentDayOfWeek = getDay(now);
  let daysUntilNext = 7; // Default to next week

  for (const day of alarm.repeatDays) {
    // Adjust day based on timezone conversion offset
    let adjustedDay = (day + dayOffset + 7) % 7;
    let daysAway = (adjustedDay - currentDayOfWeek + 7) % 7;

    // If it's today and the time has passed, look for next week
    if (daysAway === 0 && todayAlarmTime <= now) {
      daysAway = 7;
    }

    if (daysAway < daysUntilNext) {
      daysUntilNext = daysAway;
    }
  }

  const nextTrigger = new Date(todayAlarmTime);
  nextTrigger.setDate(nextTrigger.getDate() + daysUntilNext);

  return nextTrigger;
}

/**
 * Generate a unique alarm ID
 * @returns UUID-like string
 */
export function generateAlarmId(): string {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
