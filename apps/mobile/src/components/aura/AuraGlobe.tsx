import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LocationData, WeatherData, getSemanticTimeOfDay } from '@aura/shared';
import { getWeatherAtmosphere } from '../../utils/weatherUtils';
import Clock from './Clock';
import { Moon, Sun, Coffee } from 'lucide-react-native';

interface AuraGlobeProps {
  location: LocationData | null;
  weather: WeatherData | null;
  position: 'top' | 'bottom';
  distance?: number | null;
  // v2.5.0: Personalization
  profile?: {
    name: string;
    emoji?: string;
    statusMessage?: string;
  };
  onEditStatus?: () => void;
}

/**
 * AuraGlobe - Location information panel matching web design
 * Displays location name, time, temperature, weather, and time status
 */
const AuraGlobe: React.FC<AuraGlobeProps> = ({
  location,
  weather,
  position,
  distance = null,
  profile, // v2.5.0
  onEditStatus, // v2.5.0
}) => {
  const isTop = position === 'top';

  // Get weather atmosphere (gradient and icon)
  const atmosphere = useMemo(() => {
    if (!weather) return null;
    return getWeatherAtmosphere(
      weather.current.weather_code,
      weather.current.is_day === 1,
      distance
    );
  }, [weather, distance]);

  // Get semantic time of day
  const timeStatus = useMemo(() => {
    if (!weather) return null;
    const hour = new Date(weather.current.time).getHours();
    const status = getSemanticTimeOfDay(hour);
    // getSemanticTimeOfDay returns just a string, not an object with icon
    return status;
  }, [weather]);

  // Get time status icon (React Native compatible)
  const getTimeStatusIcon = (status: string | null) => {
    if (!status) return null;

    const iconSize = 16;
    const iconColor = 'rgba(255, 255, 255, 0.8)';

    if (status === 'Resting' || status === 'Evening') {
      return <Moon size={iconSize} color={iconColor} />;
    }
    if (status === 'Morning') {
      return <Coffee size={iconSize} color={iconColor} />;
    }
    if (status === 'Daytime') {
      return <Sun size={iconSize} color={iconColor} />;
    }
    return null;
  };

  // Get weather icon (React Native compatible)
  const getWeatherIcon = () => {
    if (!atmosphere) return null;

    // The atmosphere.icon from web is a React element, we need to handle it for RN
    // For now, we'll return the description text
    // TODO: Implement proper icon mapping
    return atmosphere.description;
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
        {/* v2.5.0: Name + Emoji Header */}
        {profile && (
          <View style={styles.profileHeader}>
            {profile.emoji && <Text style={styles.profileEmoji}>{profile.emoji}</Text>}
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
        )}

        {/* Location name */}
        <Text style={styles.locationName}>
          {profile ? `in ${location?.name || '...'}` : location?.name || '...'}
        </Text>

        {/* Clock */}
        {weather ? (
          <Clock timeZone={weather.timezone} style={styles.clock} />
        ) : (
          <Text style={styles.clock}>--:--</Text>
        )}

        {/* Time status */}
        {timeStatus && (
          <View style={styles.timeStatus}>
            {getTimeStatusIcon(timeStatus)}
            <Text style={styles.timeStatusText}>{timeStatus}</Text>
          </View>
        )}

        {/* Temperature and weather */}
        <View style={styles.weatherContainer}>
          <Text style={styles.temperature}>
            {atmosphere ? `${Math.round(weather!.current.temperature_2m)}°` : '--°'}
          </Text>
          <View style={styles.weatherInfo}>
            {/* Weather icon placeholder - will be styled separately */}
            <View style={styles.weatherIconContainer}>
              {/* Icon would go here - simplified for now */}
              <Text style={styles.weatherIcon}>☁️</Text>
            </View>
            <Text style={styles.weatherDescription}>
              {atmosphere?.description || ''}
            </Text>
          </View>
        </View>

        {/* Sunrise/Sunset times */}
        {weather && (
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

        {/* v2.5.0: Status Message */}
        {profile?.statusMessage && (
          <TouchableOpacity
            style={styles.statusContainer}
            onPress={onEditStatus}
            activeOpacity={0.7}
          >
            <Text style={styles.statusMessage}>"{profile.statusMessage}"</Text>
            {onEditStatus && (
              <Text style={styles.statusHint}>Tap to edit</Text>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  top: {
    top: 48,
  },
  bottom: {
    bottom: 48,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    padding: 16,
  },
  // v2.5.0: Profile styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileEmoji: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  locationName: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  clock: {
    fontSize: 64,
    fontWeight: '200',
    color: 'white',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  timeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
    marginBottom: 8,
  },
  timeStatusText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  temperature: {
    fontSize: 56,
    fontWeight: '300',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  weatherInfo: {
    alignItems: 'flex-start',
  },
  weatherIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 32,
  },
  weatherDescription: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sunTimesContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  sunTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sunTimeLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sunTimeValue: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // v2.5.0: Status message styles
  statusContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statusHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AuraGlobe;
