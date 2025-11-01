/**
 * Utilities for detecting Daylight Saving Time (DST) information
 */

export interface DSTInfo {
  isDST: boolean;
  standardOffset: number; // Offset in minutes during standard time
  dstOffset: number; // Offset in minutes during DST
  timezoneName: string;
  transitionWarning: string | null; // Warning message if transition is coming soon
}

/**
 * Check if a timezone is currently observing DST
 * More reliable method using timezone name abbreviation
 */
export function isDaylightSavingTime(timeZone: string, date: Date = new Date()): boolean {
  try {
    // Method 1: Check timezone abbreviation (most reliable)
    const tzString = date.toLocaleString('en-US', {
      timeZone,
      timeZoneName: 'short',
    });

    // Common DST indicators
    const dstIndicators = ['PDT', 'EDT', 'CDT', 'MDT', 'CEST', 'BST', 'EEST', 'NZDT', 'AEDT'];
    const hasDSTIndicator = dstIndicators.some(indicator => tzString.includes(indicator));

    if (hasDSTIndicator) return true;

    // Method 2: Fallback to offset comparison
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    const janOffset = getTimezoneOffset(timeZone, jan);
    const julOffset = getTimezoneOffset(timeZone, jul);

    // If offsets are the same, no DST is observed
    if (janOffset === julOffset) {
      return false;
    }

    const currentOffset = getTimezoneOffset(timeZone, date);

    // DST is when offset is LESS than standard offset (more negative = more ahead of UTC)
    // For Northern Hemisphere: DST offset < standard offset (e.g., -420 vs -480)
    // For Southern Hemisphere: DST offset < standard offset
    return currentOffset < Math.max(janOffset, julOffset);
  } catch (e) {
    console.error('Error detecting DST:', e);
    return false;
  }
}

/**
 * Get timezone offset in minutes for a specific date
 */
function getTimezoneOffset(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getValue = (type: string) => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  const tzDate = new Date(
    getValue('year'),
    getValue('month') - 1,
    getValue('day'),
    getValue('hour'),
    getValue('minute'),
    getValue('second')
  );

  return (tzDate.getTime() - date.getTime()) / (1000 * 60);
}

/**
 * Get comprehensive DST information for a timezone
 */
export function getDSTInfo(timeZone: string): DSTInfo {
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);

    const janOffset = getTimezoneOffset(timeZone, jan);
    const julOffset = getTimezoneOffset(timeZone, jul);

    // Determine standard and DST offsets
    const standardOffset = Math.max(janOffset, julOffset);
    const dstOffset = Math.min(janOffset, julOffset);

    const isDST = isDaylightSavingTime(timeZone, now);

    // Get timezone name
    const timezoneName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'long',
    })
      .formatToParts(now)
      .find(part => part.type === 'timeZoneName')?.value || timeZone;

    // Check for upcoming transitions (within next 14 days)
    const transitionWarning = checkUpcomingTransition(timeZone, now);

    return {
      isDST,
      standardOffset,
      dstOffset,
      timezoneName,
      transitionWarning,
    };
  } catch (e) {
    console.error('Error getting DST info:', e);
    return {
      isDST: false,
      standardOffset: 0,
      dstOffset: 0,
      timezoneName: timeZone,
      transitionWarning: null,
    };
  }
}

/**
 * Check if DST transition is coming soon (within 14 days)
 */
function checkUpcomingTransition(timeZone: string, now: Date): string | null {
  try {
    const currentIsDST = isDaylightSavingTime(timeZone, now);

    // Check each day for the next 14 days
    for (let i = 1; i <= 14; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + i);

      const futureIsDST = isDaylightSavingTime(timeZone, futureDate);

      if (currentIsDST !== futureIsDST) {
        const daysUntil = i;
        const transitionType = currentIsDST ? 'Standard Time' : 'Daylight Saving Time';

        // Get transition time info
        const transitionDate = futureDate.toLocaleDateString('en-US', {
          timeZone,
          month: 'short',
          day: 'numeric',
        });

        if (daysUntil === 1) {
          return `Clocks change TOMORROW (${transitionDate})!\nSwitching to ${transitionType}`;
        } else if (daysUntil === 2) {
          return `Clocks change in 2 days (${transitionDate})\nSwitching to ${transitionType}`;
        } else if (daysUntil <= 7) {
          return `Clocks change in ${daysUntil} days (${transitionDate})\nSwitching to ${transitionType}`;
        } else {
          return `Clocks change on ${transitionDate}\nSwitching to ${transitionType}`;
        }
      }
    }

    return null;
  } catch (e) {
    console.error('Error checking DST transition:', e);
    return null;
  }
}

/**
 * Format DST status for display
 */
export function formatDSTStatus(dstInfo: DSTInfo): string {
  if (dstInfo.standardOffset === dstInfo.dstOffset) {
    return 'No DST observed';
  }

  return dstInfo.isDST ? 'Daylight Saving Time' : 'Standard Time';
}
