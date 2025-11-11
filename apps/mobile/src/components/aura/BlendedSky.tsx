import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherData } from '@aura/shared';
import { getWeatherAtmosphere } from '../../utils/weatherUtils';
import CelestialSky from './CelestialSky';
import EnhancedStarfield from './EnhancedStarfield';
import {
  EnhancedRainEffect,
  EnhancedSnowEffect,
  CloudEffect,
  EnhancedThunderstormEffect,
} from './weather-effects';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BlendedSkyProps {
  topWeather: WeatherData | null; // v2.6.6: Renamed for clarity (respects swap state)
  bottomWeather: WeatherData | null; // v2.6.6: Renamed for clarity (respects swap state)
  distance: number | null;
}

/**
 * Helper function to determine weather effect based on weather code
 */
const getWeatherEffect = (weatherCode: number) => {
  // Rain (51-65, 80-82)
  if (weatherCode >= 51 && weatherCode <= 55) return { type: 'rain', intensity: 'light' as const };
  if (weatherCode >= 61 && weatherCode <= 63) return { type: 'rain', intensity: 'moderate' as const };
  if (weatherCode === 65 || weatherCode >= 80 && weatherCode <= 82) return { type: 'rain', intensity: 'heavy' as const };

  // Snow (71-86)
  if (weatherCode >= 71 && weatherCode <= 73) return { type: 'snow', intensity: 'light' as const };
  if (weatherCode === 75 || weatherCode === 85) return { type: 'snow', intensity: 'moderate' as const };
  if (weatherCode === 86) return { type: 'snow', intensity: 'heavy' as const };

  // Thunderstorm (95-99)
  if (weatherCode >= 95 && weatherCode <= 99) return { type: 'thunderstorm' };

  // Clouds (2-3)
  if (weatherCode === 2) return { type: 'clouds', density: 'partly' as const };
  if (weatherCode === 3) return { type: 'clouds', density: 'overcast' as const };

  return null;
};

/**
 * BlendedSky - Blended gradient sky system with dynamic weather effects
 * v2.6.6: Now respects swap state via topWeather/bottomWeather props
 */
const BlendedSky: React.FC<BlendedSkyProps> = ({
  topWeather,
  bottomWeather,
  distance,
}) => {
  // Get gradient colors for each weather
  const topAtmosphere = topWeather
    ? getWeatherAtmosphere(
        topWeather.current.weather_code,
        topWeather.current.is_day === 1,
        distance
      )
    : null;

  const bottomAtmosphere = bottomWeather
    ? getWeatherAtmosphere(
        bottomWeather.current.weather_code,
        bottomWeather.current.is_day === 1,
        distance
      )
    : null;

  // Get gradient colors - now directly from atmosphere.gradient which is already a tuple
  const topColors = topAtmosphere?.gradient || ['#64748b', '#334155'];
  const bottomColors = bottomAtmosphere?.gradient || ['#64748b', '#334155'];

  // Determine weather effects for each half
  const topWeatherEffect = topWeather ? getWeatherEffect(topWeather.current.weather_code) : null;
  const bottomWeatherEffect = bottomWeather ? getWeatherEffect(bottomWeather.current.weather_code) : null;

  // Determine if it's night time for both locations (for starfield)
  const isTopNight = topWeather ? topWeather.current.is_day === 0 : false;
  const isBottomNight = bottomWeather ? bottomWeather.current.is_day === 0 : false;
  const isAnyNight = isTopNight || isBottomNight;

  return (
    <View style={styles.container}>
      {/* Top half - NO MASK, clean separation */}
      <View style={styles.topHalf}>
        {/* Background gradient */}
        <LinearGradient
          colors={topColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Starfield for top (only if night) */}
        {isTopNight && (
          <View style={StyleSheet.absoluteFill}>
            <EnhancedStarfield
              density={0.6}
              enableShootingStars={false}
              isNight={true}
            />
          </View>
        )}

        {/* Celestial body for top half */}
        {topWeather && (
          <CelestialSky weather={topWeather} isTop={true} />
        )}

        {/* Weather effects for top half */}
        {topWeatherEffect && topWeather && (
          <View style={StyleSheet.absoluteFill}>
            {topWeatherEffect.type === 'rain' && (
              <EnhancedRainEffect
                intensity={topWeatherEffect.intensity}
                isDay={topWeather.current.is_day === 1}
              />
            )}
            {topWeatherEffect.type === 'snow' && (
              <EnhancedSnowEffect
                intensity={topWeatherEffect.intensity}
                isDay={topWeather.current.is_day === 1}
              />
            )}
            {topWeatherEffect.type === 'clouds' && (
              <CloudEffect
                density={topWeatherEffect.density}
                isDay={topWeather.current.is_day === 1}
              />
            )}
            {topWeatherEffect.type === 'thunderstorm' && (
              <EnhancedThunderstormEffect isDay={topWeather.current.is_day === 1} />
            )}
          </View>
        )}

        {/* Soft gradient overlay at bottom to blend with bottom half */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.15)',
            'rgba(0,0,0,0.25)',
          ]}
          locations={[0.6, 0.75, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      {/* Bottom half - NO MASK, clean separation */}
      <View style={styles.bottomHalf}>
        {/* Background gradient */}
        <LinearGradient
          colors={bottomColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Starfield for bottom (only if night) */}
        {isBottomNight && (
          <View style={StyleSheet.absoluteFill}>
            <EnhancedStarfield
              density={0.6}
              enableShootingStars={false}
              isNight={true}
            />
          </View>
        )}

        {/* Celestial body for bottom half */}
        {bottomWeather && <CelestialSky weather={bottomWeather} isTop={false} />}

        {/* Weather effects for bottom half */}
        {bottomWeatherEffect && bottomWeather && (
          <View style={StyleSheet.absoluteFill}>
            {bottomWeatherEffect.type === 'rain' && (
              <EnhancedRainEffect
                intensity={bottomWeatherEffect.intensity}
                isDay={bottomWeather.current.is_day === 1}
              />
            )}
            {bottomWeatherEffect.type === 'snow' && (
              <EnhancedSnowEffect
                intensity={bottomWeatherEffect.intensity}
                isDay={bottomWeather.current.is_day === 1}
              />
            )}
            {bottomWeatherEffect.type === 'clouds' && (
              <CloudEffect
                density={bottomWeatherEffect.density}
                isDay={bottomWeather.current.is_day === 1}
              />
            )}
            {bottomWeatherEffect.type === 'thunderstorm' && (
              <EnhancedThunderstormEffect isDay={bottomWeather.current.is_day === 1} />
            )}
          </View>
        )}

        {/* Soft gradient overlay at top to blend with top half */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0.15)',
            'rgba(0,0,0,0.05)',
            'transparent',
          ]}
          locations={[0, 0.1, 0.25, 0.4]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5, // Clean 50% split
    overflow: 'hidden', // Prevent content from spilling over
  },
  bottomHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5, // Clean 50% split
    overflow: 'hidden', // Prevent content from spilling over
  },
});

export default BlendedSky;
