import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LocationData, WeatherData } from '@aura/shared';
import Clock from './Clock';

interface AuraGlobeMinimalProps {
  location: LocationData | null;
  weather: WeatherData | null;
  position: 'top' | 'bottom';
  // v2.6.0: Display settings
  showProfileInfo?: boolean;
  showSunTimes?: boolean;
  showTimeStatus?: boolean;
  profile?: {
    name: string;
    emoji?: string;
  };
}

/**
 * AuraGlobeMinimal - Minimalist location panel
 * v2.6.0: Redesigned for extreme simplicity
 *
 * Core information only (Minimal mode):
 * - City name (clean, small text)
 * - Time (large, prominent)
 * - Temperature + Weather icon (essential)
 *
 * Optional elements (controlled by DisplaySettings):
 * - Profile name + emoji (Balanced/Detailed)
 * - Sunrise/Sunset times (Detailed)
 * - Time status icon (Detailed)
 */
const AuraGlobeMinimal: React.FC<AuraGlobeMinimalProps> = ({
  location,
  weather,
  position,
  showProfileInfo = false,
  showSunTimes = false,
  showTimeStatus = false,
  profile,
}) => {
  const isTop = position === 'top';

  // Get weather icon (simplified)
  const getWeatherIcon = () => {
    if (!weather) return '☁️';
    const code = weather.current.weather_code;
    const isDay = weather.current.is_day === 1;

    // Simplified weather icons
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code <= 3) return isDay ? '🌤️' : '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '☁️';
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(800)}
      style={[
        styles.container,
        isTop ? styles.top : styles.bottom,
      ]}
    >
      <View style={styles.content}>
        {/* Profile name + emoji (optional) */}
        {showProfileInfo && profile && (
          <View style={styles.profileHeader}>
            {profile.emoji && <Text style={styles.profileEmoji}>{profile.emoji}</Text>}
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
        )}

        {/* City name - always shown */}
        <Text style={styles.cityName}>
          {showProfileInfo && profile ? `in ${location?.name || '...'}` : location?.name || '...'}
        </Text>

        {/* Clock - always shown (core element) */}
        {weather ? (
          <Clock timeZone={weather.timezone} style={styles.clock} />
        ) : (
          <Text style={styles.clock}>--:--</Text>
        )}

        {/* Temperature + Weather - always shown (core element) */}
        <View style={styles.weatherRow}>
          <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
          <Text style={styles.temperature}>
            {weather ? `${Math.round(weather.current.temperature_2m)}°` : '--°'}
          </Text>
        </View>

        {/* Sunrise/Sunset times (optional) */}
        {showSunTimes && weather && (
          <View style={styles.sunTimesContainer}>
            <View style={styles.sunTime}>
              <Text style={styles.sunTimeLabel}>↑</Text>
              <Text style={styles.sunTimeValue}>
                {new Date(weather.daily.sunrise[0]).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: weather.timezone,
                })}
              </Text>
            </View>
            <View style={styles.sunTime}>
              <Text style={styles.sunTimeLabel}>↓</Text>
              <Text style={styles.sunTimeValue}>
                {new Date(weather.daily.sunset[0]).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: weather.timezone,
                })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  top: {
    top: 60,
  },
  bottom: {
    bottom: 60,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  // Profile (optional)
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileEmoji: {
    fontSize: 28,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  // City name (core)
  cityName: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.85)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  // Clock (core)
  clock: {
    fontSize: 72,
    fontWeight: '200',
    color: 'white',
    letterSpacing: -3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  // Weather (core)
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  weatherIcon: {
    fontSize: 40,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  // Sunrise/Sunset (optional)
  sunTimesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  sunTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sunTimeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sunTimeValue: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.75)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default AuraGlobeMinimal;
