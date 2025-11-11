import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { WeatherData } from '@aura/shared';
import {
  calculateTimePercentage,
  calculateCelestialRotation,
} from '../../utils/animationUtils';
import {
  CELESTIAL_CONFIG,
  ANIMATION_DURATIONS,
} from '../../constants/Animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CelestialSkyProps {
  weather: WeatherData | null;
  isTop: boolean;
}

/**
 * CelestialSky - Animated sun/moon following realistic celestial path
 * Based on actual sunrise/sunset times from weather data
 */
const CelestialSky: React.FC<CelestialSkyProps> = ({ weather, isTop }) => {
  const rotation = useSharedValue(0);

  const celestialData = useMemo(() => {
    if (!weather) {
      return {
        rotation: 0,
        color: CELESTIAL_CONFIG.SUN_COLOR,
        isDay: true,
      };
    }

    const now = new Date(weather.current.time);
    const sunrise = new Date(weather.daily.sunrise[0]);
    const sunset = new Date(weather.daily.sunset[0]);
    const isDay = weather.current.is_day === 1;

    const timePercentage = calculateTimePercentage(now, sunrise, sunset, isDay);
    const calculatedRotation = calculateCelestialRotation(timePercentage, isTop);
    const color = isDay ? CELESTIAL_CONFIG.SUN_COLOR : CELESTIAL_CONFIG.MOON_COLOR;

    return {
      rotation: calculatedRotation,
      color,
      isDay,
    };
  }, [weather, isTop]);

  useEffect(() => {
    if (weather) {
      // Smoothly animate to new rotation
      rotation.value = withTiming(celestialData.rotation, {
        duration: ANIMATION_DURATIONS.CELESTIAL_UPDATE,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [celestialData.rotation, weather]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  if (!weather) return null;

  return (
    <View style={[styles.celestialPath, isTop ? styles.top : styles.bottom]}>
      <Animated.View style={[styles.celestialOrbit, animatedStyle]}>
        <View
          style={[
            styles.celestialBody,
            {
              shadowColor: celestialData.isDay ? '#FFD700' : '#E0E0E0',
            },
          ]}
        >
          {/* Enhanced glow rings for more prominence */}
          {celestialData.isDay ? (
            <>
              {/* Sun - Multiple glow layers */}
              <View style={[styles.celestialOuterGlow, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]} />
              <View style={[styles.celestialMiddleGlow, { backgroundColor: 'rgba(255, 215, 0, 0.3)' }]} />
              <View
                style={[
                  styles.celestialGlow,
                  {
                    backgroundColor: celestialData.color,
                    shadowColor: '#FFD700',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 40,
                  },
                ]}
              />
            </>
          ) : (
            <>
              {/* Moon - Softer glow */}
              <View style={[styles.celestialOuterGlow, { backgroundColor: 'rgba(224, 224, 224, 0.15)' }]} />
              <View
                style={[
                  styles.celestialGlow,
                  {
                    backgroundColor: celestialData.color,
                    shadowColor: '#E0E0E0',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 25,
                  },
                ]}
              />
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  celestialPath: {
    position: 'absolute',
    left: '50%',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 0.75,
    marginLeft: -(SCREEN_WIDTH * 0.75),
    pointerEvents: 'none',
  },
  top: {
    bottom: '50%',
    transform: [{ translateY: -40 }, { rotate: '0deg' }],
  },
  bottom: {
    top: '50%',
    transform: [{ translateY: -40 }, { rotate: '180deg' }],
  },
  celestialOrbit: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  celestialBody: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: CELESTIAL_CONFIG.GLOW_RADIUS * 2,
    height: CELESTIAL_CONFIG.GLOW_RADIUS * 2,
    marginLeft: -CELESTIAL_CONFIG.GLOW_RADIUS,
    marginTop: -CELESTIAL_CONFIG.GLOW_RADIUS,
    borderRadius: CELESTIAL_CONFIG.GLOW_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  celestialGlow: {
    width: CELESTIAL_CONFIG.GLOW_RADIUS,
    height: CELESTIAL_CONFIG.GLOW_RADIUS,
    borderRadius: CELESTIAL_CONFIG.GLOW_RADIUS / 2,
    position: 'absolute',
  },
  celestialOuterGlow: {
    width: CELESTIAL_CONFIG.GLOW_RADIUS * 2.5,
    height: CELESTIAL_CONFIG.GLOW_RADIUS * 2.5,
    borderRadius: CELESTIAL_CONFIG.GLOW_RADIUS * 1.25,
    position: 'absolute',
    left: -(CELESTIAL_CONFIG.GLOW_RADIUS * 0.75),
    top: -(CELESTIAL_CONFIG.GLOW_RADIUS * 0.75),
  },
  celestialMiddleGlow: {
    width: CELESTIAL_CONFIG.GLOW_RADIUS * 1.8,
    height: CELESTIAL_CONFIG.GLOW_RADIUS * 1.8,
    borderRadius: CELESTIAL_CONFIG.GLOW_RADIUS * 0.9,
    position: 'absolute',
    left: -(CELESTIAL_CONFIG.GLOW_RADIUS * 0.4),
    top: -(CELESTIAL_CONFIG.GLOW_RADIUS * 0.4),
  },
});

export default CelestialSky;
