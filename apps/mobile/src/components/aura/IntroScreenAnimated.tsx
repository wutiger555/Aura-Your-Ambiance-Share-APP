import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

interface IntroScreenAnimatedProps {
  onComplete: () => void;
}

/**
 * IntroScreenAnimated - Elegant minimal intro with breathing animation
 * v2.6.5: Lightweight animations for simulator compatibility
 *
 * Memory optimization:
 * - Only 2 shared values (logoOpacity, logoScale)
 * - Simple breathing animation (no withRepeat)
 * - Short duration (3s total)
 * - Static glow rings (no animation)
 *
 * Total Shared Values: 2 (safe for most simulators)
 */
export default function IntroScreenAnimated({ onComplete }: IntroScreenAnimatedProps) {
  // Minimal shared values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);

  useEffect(() => {
    // Simple fade-in and breathing sequence
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    // Gentle breathing: scale up slightly, then back
    logoScale.value = withSequence(
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      }),
      withDelay(
        400,
        withTiming(1.05, {
          duration: 600,
          easing: Easing.inOut(Easing.sine),
        })
      ),
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.sine),
      })
    );

    // Complete after 3 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

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

        {/* Animated Aura Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
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
