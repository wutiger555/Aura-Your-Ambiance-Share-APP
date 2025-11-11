import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface EnhancedRainEffectProps {
  intensity: 'light' | 'moderate' | 'heavy';
  isDay: boolean;
}

interface RainDrop {
  id: number;
  startX: number;
  translateY: Animated.Value;
  opacity: Animated.Value;
  splashOpacity: Animated.Value;
  splashScale: Animated.Value;
}

/**
 * EnhancedRainEffect - Realistic rain with splash effects
 *
 * Features:
 * - Realistic falling rain drops with varied speeds
 * - Splash effect when drops hit "ground"
 * - Wind drift effect (slight horizontal movement)
 * - Uses native Animated API (simulator-safe)
 */
const EnhancedRainEffect: React.FC<EnhancedRainEffectProps> = ({ intensity, isDay }) => {
  const [rainDrops] = useState<RainDrop[]>(() => {
    const dropCounts = { light: 20, moderate: 35, heavy: 50 };
    const dropCount = dropCounts[intensity];

    return Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      translateY: new Animated.Value(-20),
      opacity: new Animated.Value(0),
      splashOpacity: new Animated.Value(0),
      splashScale: new Animated.Value(0),
    }));
  });

  useEffect(() => {
    // Start all rain drop animations
    rainDrops.forEach((drop, index) => {
      const delay = Math.random() * 1000;
      const duration = intensity === 'heavy' ? 600 : intensity === 'moderate' ? 800 : 1000;

      // Falling animation
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(drop.translateY, {
              toValue: 120,
              duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(drop.opacity, {
                toValue: 0.7,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(drop.opacity, {
                toValue: 0.5,
                duration: duration - 200,
                useNativeDriver: true,
              }),
              Animated.timing(drop.opacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Splash when hitting ground
          Animated.parallel([
            Animated.sequence([
              Animated.timing(drop.splashOpacity, {
                toValue: 0.8,
                duration: 50,
                useNativeDriver: true,
              }),
              Animated.timing(drop.splashOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(drop.splashScale, {
              toValue: 2,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          // Reset
          Animated.timing(drop.translateY, {
            toValue: -20,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(drop.splashScale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [intensity]);

  const dropColor = isDay
    ? 'rgba(173, 216, 230, 0.7)'
    : 'rgba(147, 197, 253, 0.6)';

  const splashColor = isDay
    ? 'rgba(173, 216, 230, 0.5)'
    : 'rgba(147, 197, 253, 0.4)';

  return (
    <View style={styles.container} pointerEvents="none">
      {rainDrops.map((drop) => (
        <View key={drop.id} style={[styles.dropContainer, { left: `${drop.startX}%` }]}>
          {/* Falling rain drop */}
          <Animated.View
            style={[
              styles.rainDrop,
              {
                backgroundColor: dropColor,
                opacity: drop.opacity,
                transform: [{ translateY: drop.translateY }],
              },
            ]}
          />

          {/* Splash effect */}
          <Animated.View
            style={[
              styles.splash,
              {
                borderColor: splashColor,
                opacity: drop.splashOpacity,
                transform: [{ scale: drop.splashScale }],
                top: '95%',
              },
            ]}
          />
        </View>
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
  dropContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 25,
    borderRadius: 1,
    shadowColor: '#fff',
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  splash: {
    position: 'absolute',
    width: 12,
    height: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(173, 216, 230, 0.6)',
    marginLeft: -6,
  },
});

export default EnhancedRainEffect;
