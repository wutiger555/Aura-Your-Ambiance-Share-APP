import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface EnhancedSnowEffectProps {
  intensity: 'light' | 'moderate' | 'heavy';
  isDay: boolean;
}

interface Snowflake {
  id: number;
  startX: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  scale: number;
}

/**
 * EnhancedSnowEffect - Realistic snowflakes with rotation and drift
 *
 * Features:
 * - Snowflakes rotate as they fall (360° spin)
 * - Horizontal drift (wind effect)
 * - Varied sizes for depth perception
 * - Gentle falling speed
 * - Uses native Animated API
 */
const EnhancedSnowEffect: React.FC<EnhancedSnowEffectProps> = ({ intensity, isDay }) => {
  const [snowflakes] = useState<Snowflake[]>(() => {
    const flakeCounts = { light: 25, moderate: 40, heavy: 60 };
    const flakeCount = flakeCounts[intensity];

    return Array.from({ length: flakeCount }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      translateY: new Animated.Value(-10),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: 0.5 + Math.random() * 0.7, // 0.5-1.2x size for depth
    }));
  });

  useEffect(() => {
    snowflakes.forEach((flake) => {
      const delay = Math.random() * 2000;
      const duration = 8000 + Math.random() * 4000; // 8-12 seconds fall
      const driftDistance = (Math.random() - 0.5) * 60; // -30 to +30 drift

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            // Falling
            Animated.timing(flake.translateY, {
              toValue: 120,
              duration,
              useNativeDriver: true,
            }),
            // Horizontal drift (wind)
            Animated.sequence([
              Animated.timing(flake.translateX, {
                toValue: driftDistance / 2,
                duration: duration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(flake.translateX, {
                toValue: driftDistance,
                duration: duration / 2,
                useNativeDriver: true,
              }),
            ]),
            // Rotation (full 360° spin)
            Animated.timing(flake.rotate, {
              toValue: 360,
              duration,
              useNativeDriver: true,
            }),
            // Fade in/out
            Animated.sequence([
              Animated.timing(flake.opacity, {
                toValue: 0.9,
                duration: duration * 0.1,
                useNativeDriver: true,
              }),
              Animated.timing(flake.opacity, {
                toValue: 0.7,
                duration: duration * 0.8,
                useNativeDriver: true,
              }),
              Animated.timing(flake.opacity, {
                toValue: 0,
                duration: duration * 0.1,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Reset
          Animated.parallel([
            Animated.timing(flake.translateY, {
              toValue: -10,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(flake.translateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(flake.rotate, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  const flakeColor = isDay
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(220, 238, 255, 0.85)';

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Animated.View
          key={flake.id}
          style={[
            styles.snowflake,
            {
              left: `${flake.startX}%`,
              opacity: flake.opacity,
              transform: [
                { translateY: flake.translateY },
                { translateX: flake.translateX },
                { rotate: flake.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
                { scale: flake.scale },
              ],
            },
          ]}
        >
          {/* Snowflake shape (6-pointed star) */}
          <View style={[styles.flakeCore, { backgroundColor: flakeColor }]} />
          <View style={[styles.flakeArm, styles.flakeArmH, { backgroundColor: flakeColor }]} />
          <View style={[styles.flakeArm, styles.flakeArmV, { backgroundColor: flakeColor }]} />
          <View style={[styles.flakeArm, styles.flakeArmD1, { backgroundColor: flakeColor }]} />
          <View style={[styles.flakeArm, styles.flakeArmD2, { backgroundColor: flakeColor }]} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  snowflake: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flakeCore: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  flakeArm: {
    position: 'absolute',
    borderRadius: 0.5,
  },
  flakeArmH: {
    width: 10,
    height: 1,
  },
  flakeArmV: {
    width: 1,
    height: 10,
  },
  flakeArmD1: {
    width: 8,
    height: 1,
    transform: [{ rotate: '45deg' }],
  },
  flakeArmD2: {
    width: 8,
    height: 1,
    transform: [{ rotate: '-45deg' }],
  },
});

export default EnhancedSnowEffect;
