import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

interface IntroScreenNativeProps {
  onComplete: () => void;
}

/**
 * IntroScreenNative - Uses React Native's built-in Animated API
 * v2.6.5: Ultra-lightweight, NO Reanimated dependency
 *
 * Why Native Animated:
 * - Uses RN's built-in Animated (NOT Reanimated)
 * - NO shared values, NO worklets, NO JS<->Native bridge
 * - Runs on UI thread without extra memory overhead
 * - Compatible with ALL iOS Simulators
 *
 * Animation:
 * - Logo fades in with gentle scale-up
 * - Simple and elegant, no breathing cycles
 * - 2.5 second duration
 */
export default function IntroScreenNative({ onComplete }: IntroScreenNativeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Simple parallel fade + scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Complete after 2.5 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timeout);
  }, [fadeAnim, scaleAnim, onComplete]);

  return (
    <View style={styles.container}>
      {/* Starry gradient background */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Static subtle glow rings */}
        <View style={styles.outerGlow}>
          <View style={styles.outerGlowInner} />
        </View>

        <View style={styles.innerGlow}>
          <View style={styles.innerGlowInner} />
        </View>

        {/* Animated Aura Logo (using native Animated API) */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <AuraLogo size={160} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0118',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  innerGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    zIndex: 5,
    opacity: 0.6,
  },
  innerGlowInner: {
    flex: 1,
    borderRadius: 120,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  outerGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    zIndex: 3,
    opacity: 0.4,
  },
  outerGlowInner: {
    flex: 1,
    borderRadius: 160,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
});
