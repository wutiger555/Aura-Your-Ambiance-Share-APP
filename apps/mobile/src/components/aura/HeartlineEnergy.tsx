import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartlineEnergyProps {
  /** Curve path control points */
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  endX: number;
  endY: number;
  /** Color of energy effects */
  color?: string;
}

/**
 * HeartlineEnergy - Pulse waves and energy bursts along the connection
 *
 * Features:
 * - Pulse waves that travel along the curve
 * - Energy burst at center meeting point
 * - Uses native Animated API (no Reanimated memory overhead)
 * - Smooth 60fps animations
 */
const HeartlineEnergy: React.FC<HeartlineEnergyProps> = ({
  startX,
  startY,
  controlX,
  controlY,
  endX,
  endY,
  color = 'rgba(167, 139, 250, 0.6)',
}) => {
  // Calculate center point of the curve
  const centerX = (startX + endX) / 2;
  const centerY = controlY; // Approximate center

  // Pulse wave animations (3 waves with staggered timing)
  const wave1Progress = useRef(new Animated.Value(0)).current;
  const wave2Progress = useRef(new Animated.Value(0)).current;
  const wave3Progress = useRef(new Animated.Value(0)).current;

  // Center burst animation
  const burstScale = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse wave 1: Travels from start to end
    const wave1Anim = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Progress, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse wave 2: Delayed start
    const wave2Anim = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(wave2Progress, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2Progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse wave 3: Most delayed
    const wave3Anim = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(wave3Progress, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3Progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Center burst: Periodic energy explosion
    const burstAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.parallel([
          Animated.timing(burstScale, {
            toValue: 3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(burstOpacity, {
              toValue: 0.6,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(burstOpacity, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(burstScale, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    wave1Anim.start();
    wave2Anim.start();
    wave3Anim.start();
    burstAnim.start();

    return () => {
      wave1Anim.stop();
      wave2Anim.stop();
      wave3Anim.stop();
      burstAnim.stop();
    };
  }, []);

  // Interpolate wave positions along the curve (simplified linear for performance)
  const wave1X = wave1Progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });
  const wave1Y = wave1Progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startY, controlY, endY],
  });

  const wave2X = wave2Progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });
  const wave2Y = wave2Progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startY, controlY, endY],
  });

  const wave3X = wave3Progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });
  const wave3Y = wave3Progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startY, controlY, endY],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Pulse wave 1 */}
      <Animated.View
        style={[
          styles.pulseWave,
          {
            left: wave1X,
            top: wave1Y,
            backgroundColor: color,
          },
        ]}
      />

      {/* Pulse wave 2 */}
      <Animated.View
        style={[
          styles.pulseWave,
          {
            left: wave2X,
            top: wave2Y,
            backgroundColor: color,
          },
        ]}
      />

      {/* Pulse wave 3 */}
      <Animated.View
        style={[
          styles.pulseWave,
          {
            left: wave3X,
            top: wave3Y,
            backgroundColor: color,
          },
        ]}
      />

      {/* Center energy burst */}
      <Animated.View
        style={[
          styles.centerBurst,
          {
            left: centerX,
            top: centerY,
            opacity: burstOpacity,
            transform: [{ scale: burstScale }],
          },
        ]}
      >
        <View style={[styles.burstRing, { borderColor: color }]} />
        <View style={[styles.burstCore, { backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  pulseWave: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -6,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  centerBurst: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  burstRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  burstCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default HeartlineEnergy;
