import { WeatherData } from '@aura/shared';

export interface WeatherReminder {
  type: 'temperature' | 'extreme' | 'care';
  severity: 'info' | 'warning' | 'alert';
  message: string;
  icon: string;
  partnerName: string;
}

/**
 * Analyzes partner's weather and generates caring reminder messages
 */
export function generateWeatherReminders(
  partnerWeather: WeatherData,
  partnerName: string
): WeatherReminder[] {
  const reminders: WeatherReminder[] = [];
  const temp = Math.round(partnerWeather.current.temperature_2m);
  const weatherCode = partnerWeather.current.weather_code;

  // Temperature-based reminders
  if (temp <= 0) {
    reminders.push({
      type: 'temperature',
      severity: 'alert',
      message: `${temp}°C · Freezing cold`,
      icon: '❄️',
      partnerName,
    });
  } else if (temp <= 10) {
    reminders.push({
      type: 'temperature',
      severity: 'warning',
      message: `${temp}°C · Bundle up`,
      icon: '🧥',
      partnerName,
    });
  } else if (temp >= 35) {
    reminders.push({
      type: 'temperature',
      severity: 'alert',
      message: `${temp}°C · Extremely hot`,
      icon: '🔥',
      partnerName,
    });
  } else if (temp >= 30) {
    reminders.push({
      type: 'temperature',
      severity: 'warning',
      message: `${temp}°C · Stay hydrated`,
      icon: '💧',
      partnerName,
    });
  }

  // Weather condition reminders
  // Thunderstorm (codes 95-99)
  if (weatherCode >= 95 && weatherCode <= 99) {
    reminders.push({
      type: 'extreme',
      severity: 'alert',
      message: `Thunderstorm · Stay safe`,
      icon: '⛈️',
      partnerName,
    });
  }
  // Heavy rain/snow (codes 65-67, 75-77, 85-86)
  else if (
    (weatherCode >= 65 && weatherCode <= 67) ||
    (weatherCode >= 75 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    const isSnow = weatherCode >= 71 && weatherCode <= 86;
    reminders.push({
      type: 'extreme',
      severity: 'warning',
      message: isSnow ? `Heavy snow · Stay warm` : `Heavy rain · Bring umbrella`,
      icon: isSnow ? '❄️' : '☔',
      partnerName,
    });
  }
  // Moderate rain/snow
  else if (
    (weatherCode >= 51 && weatherCode <= 65) ||
    (weatherCode >= 71 && weatherCode <= 75) ||
    (weatherCode >= 80 && weatherCode <= 84)
  ) {
    const isSnow = weatherCode >= 71 && weatherCode <= 84;
    reminders.push({
      type: 'care',
      severity: 'info',
      message: isSnow ? `Snowing · Drive safe` : `Rainy · Take umbrella`,
      icon: isSnow ? '❄️' : '🌧️',
      partnerName,
    });
  }

  // Caring messages for pleasant weather (if no alerts)
  if (reminders.length === 0) {
    if (temp >= 18 && temp <= 25 && weatherCode <= 3) {
      reminders.push({
        type: 'care',
        severity: 'info',
        message: `${temp}°C · Perfect weather`,
        icon: '✨',
        partnerName,
      });
    }
  }

  return reminders;
}

/**
 * Compares temperatures and generates reminder if there's significant difference
 */
export function generateTemperatureDifferenceReminder(
  myWeather: WeatherData,
  partnerWeather: WeatherData,
  myName: string,
  partnerName: string
): WeatherReminder | null {
  const myTemp = Math.round(myWeather.current.temperature_2m);
  const partnerTemp = Math.round(partnerWeather.current.temperature_2m);
  const diff = Math.abs(myTemp - partnerTemp);

  // Only show if difference is significant (>15°C)
  if (diff > 15) {
    return {
      type: 'temperature',
      severity: 'info',
      message: `${diff}°C apart · Different worlds`,
      icon: '🌍',
      partnerName,
    };
  }

  return null;
}

/**
 * Determines if reminders should be shown (not too frequent)
 * In a real app, this would check against last shown time in storage
 */
export function shouldShowReminders(): boolean {
  // For now, always show reminders
  // In production, implement throttling logic (e.g., once per hour)
  return true;
}
