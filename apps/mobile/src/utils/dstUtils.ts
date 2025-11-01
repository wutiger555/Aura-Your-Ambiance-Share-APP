import { getTimezoneOffset } from 'date-fns-tz';
import { add, sub } from 'date-fns';

export interface DSTTransitionInfo {
  warningMessage: string;
  transitionDate: Date;
  futureOffset: number; // The offset in minutes *after* the transition
}

export interface DSTInfo {
  isDST: boolean;
  standardOffset: number;
  dstOffset: number;
  timezoneAbbr: string;
  transitionInfo: DSTTransitionInfo | null;
}

function isDaylightSavingTime(date: Date, timeZone: string): boolean {
  const year = date.getFullYear();
  const janOffset = getTimezoneOffset(timeZone, new Date(year, 0, 1));
  const julOffset = getTimezoneOffset(timeZone, new Date(year, 6, 1));
  if (janOffset === julOffset) return false;
  const dstOffset = Math.max(janOffset, julOffset);
  const currentOffset = getTimezoneOffset(timeZone, date);
  return currentOffset === dstOffset;
}

function getTimezoneOffsetInMinutes(timeZone: string, date: Date): number {
  return getTimezoneOffset(timeZone, date) / (1000 * 60);
}

export function getDSTInfo(timeZone: string): DSTInfo {
  const now = new Date();
  const year = now.getFullYear();
  const isDST = isDaylightSavingTime(now, timeZone);

  const janOffset = getTimezoneOffsetInMinutes(timeZone, new Date(year, 0, 1));
  const julOffset = getTimezoneOffsetInMinutes(timeZone, new Date(year, 6, 1));

  const standardOffset = Math.min(janOffset, julOffset);
  const dstOffset = Math.max(janOffset, julOffset);

  const tzAbbr = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '';

  const transitionInfo = checkUpcomingTransition(timeZone, now);

  return {
    isDST,
    standardOffset,
    dstOffset,
    timezoneAbbr: tzAbbr,
    transitionInfo,
  };
}

function checkUpcomingTransition(timeZone: string, now: Date): DSTTransitionInfo | null {
  try {
    const isDSTToday = isDaylightSavingTime(now, timeZone);
    const yesterday = sub(now, { days: 1 });
    const isDSTYesterday = isDaylightSavingTime(yesterday, timeZone);

    if (isDSTYesterday !== isDSTToday) {
      const action = isDSTToday ? 'sprung forward 1 hour' : 'fell back 1 hour';
      return {
        warningMessage: `changed ${action} TODAY`,
        transitionDate: now,
        futureOffset: getTimezoneOffsetInMinutes(timeZone, now),
      };
    }

    for (let i = 1; i <= 14; i++) {
      const futureDate = add(now, { days: i });
      const futureIsDST = isDaylightSavingTime(futureDate, timeZone);
      if (isDSTToday !== futureIsDST) {
        const daysUntil = i;
        const action = futureIsDST ? 'spring forward 1 hour' : 'fall back 1 hour';
        let warningMessage = '';
        if (daysUntil === 1) {
          warningMessage = `to ${action} TOMORROW`;
        } else {
          warningMessage = `to ${action} in ${daysUntil} days`;
        }
        return {
          warningMessage,
          transitionDate: futureDate,
          futureOffset: getTimezoneOffsetInMinutes(timeZone, futureDate),
        };
      }
    }
    return null;
  } catch (e) {
    console.error('Error checking DST transition:', e);
    return null;
  }
}

export function formatUTCOffset(dstInfo: DSTInfo): string {
    const offset = dstInfo.isDST ? dstInfo.dstOffset : dstInfo.standardOffset;
    const offsetHours = offset / 60;
    const sign = offsetHours >= 0 ? '+' : '-';
    const hours = Math.abs(offsetHours);
    let baseString = `UTC${sign}${hours}`;
    if (dstInfo.standardOffset !== dstInfo.dstOffset) {
      baseString += dstInfo.isDST ? ' (Daylight)' : ' (Standard)';
    }
    return baseString;
}
