import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
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
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
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
 * Uses MaskedView to create smooth gradient blending between two weather states
 */
const BlendedSky: React.FC<BlendedSkyProps> = ({
  myWeather,
  partnerWeather,
  distance,
}) => {
  // Get gradient colors for each weather
  const myAtmosphere = myWeather
    ? getWeatherAtmosphere(
        myWeather.current.weather_code,
        myWeather.current.is_day === 1,
        distance
      )
    : null;

  const partnerAtmosphere = partnerWeather
    ? getWeatherAtmosphere(
        partnerWeather.current.weather_code,
        partnerWeather.current.is_day === 1,
        distance
      )
    : null;

  // Get gradient colors - now directly from atmosphere.gradient which is already a tuple
  const partnerColors = partnerAtmosphere?.gradient || ['#64748b', '#334155'];
  const myColors = myAtmosphere?.gradient || ['#64748b', '#334155'];

  // Determine weather effects for each half
  const myWeatherEffect = myWeather ? getWeatherEffect(myWeather.current.weather_code) : null;
  const partnerWeatherEffect = partnerWeather ? getWeatherEffect(partnerWeather.current.weather_code) : null;

  // Determine if it's night time for both locations (for starfield)
  const isMyNight = myWeather ? myWeather.current.is_day === 0 : false;
  const isPartnerNight = partnerWeather ? partnerWeather.current.is_day === 0 : false;
  const isAnyNight = isMyNight || isPartnerNight;

  return (
    <View style={styles.container}>
      {/* Top half (partner weather) with mask */}
      <MaskedView
        style={styles.topHalf}
        maskElement={
          <LinearGradient
            colors={['black', 'transparent']}
            locations={[0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <View style={StyleSheet.absoluteFill}>
          {/* Background gradient */}
          <LinearGradient
            colors={partnerColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Starfield for partner (only if night) */}
          {isPartnerNight && (
            <EnhancedStarfield
              density={0.6}
              enableShootingStars={false}
              isNight={true}
            />
          )}

          {/* Celestial body for top half */}
          {partnerWeather && (
            <CelestialSky weather={partnerWeather} isTop={true} />
          )}

          {/* Weather effects for top half */}
          {partnerWeatherEffect && partnerWeather && (
            <>
              {partnerWeatherEffect.type === 'rain' && (
                <EnhancedRainEffect
                  intensity={partnerWeatherEffect.intensity}
                  isDay={partnerWeather.current.is_day === 1}
                />
              )}
              {partnerWeatherEffect.type === 'snow' && (
                <EnhancedSnowEffect
                  intensity={partnerWeatherEffect.intensity}
                  isDay={partnerWeather.current.is_day === 1}
                />
              )}
              {partnerWeatherEffect.type === 'clouds' && (
                <CloudEffect
                  density={partnerWeatherEffect.density}
                  isDay={partnerWeather.current.is_day === 1}
                />
              )}
              {partnerWeatherEffect.type === 'thunderstorm' && (
                <EnhancedThunderstormEffect isDay={partnerWeather.current.is_day === 1} />
              )}
            </>
          )}
        </View>
      </MaskedView>

      {/* Bottom half (my weather) with mask */}
      <MaskedView
        style={styles.bottomHalf}
        maskElement={
          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0, 0.3]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <View style={StyleSheet.absoluteFill}>
          {/* Background gradient */}
          <LinearGradient
            colors={myColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Starfield for me (only if night) */}
          {isMyNight && (
            <EnhancedStarfield
              density={0.6}
              enableShootingStars={false}
              isNight={true}
            />
          )}

          {/* Celestial body for bottom half */}
          {myWeather && <CelestialSky weather={myWeather} isTop={false} />}

          {/* Weather effects for bottom half */}
          {myWeatherEffect && myWeather && (
            <>
              {myWeatherEffect.type === 'rain' && (
                <EnhancedRainEffect
                  intensity={myWeatherEffect.intensity}
                  isDay={myWeather.current.is_day === 1}
                />
              )}
              {myWeatherEffect.type === 'snow' && (
                <EnhancedSnowEffect
                  intensity={myWeatherEffect.intensity}
                  isDay={myWeather.current.is_day === 1}
                />
              )}
              {myWeatherEffect.type === 'clouds' && (
                <CloudEffect
                  density={myWeatherEffect.density}
                  isDay={myWeather.current.is_day === 1}
                />
              )}
              {myWeatherEffect.type === 'thunderstorm' && (
                <EnhancedThunderstormEffect isDay={myWeather.current.is_day === 1} />
              )}
            </>
          )}
        </View>
      </MaskedView>
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
    height: SCREEN_HEIGHT * 0.55, // 55% with overlap for smooth blend
  },
  bottomHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.55, // 55% with overlap for smooth blend
  },
});

export default BlendedSky;
