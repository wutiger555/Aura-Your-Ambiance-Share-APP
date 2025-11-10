import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

/**
 * IntroScreenPremium - Lightweight intro (3.5s)
 * v2.6.0: Memory-optimized version
 *
 * Minimized shared values to prevent memory issues
 * Flow: Logo appears → Text reveals → Complete
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // Minimize shared values - only use essential ones
  const containerOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Simple fade in
    containerOpacity.value = withTiming(1, { duration: 600 });

    // Logo scale
    logoScale.value = withDelay(
      200,
      withSequence(
        withTiming(1.1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: 200,
          easing: Easing.inOut(Easing.cubic),
        })
      )
    );

    // Text reveal
    textOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // Complete at 3.5s
    const timeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
      locations={[0, 0.35, 0.65, 1]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={['#06b6d4', '#a78bfa', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>AURA</Text>
          </LinearGradient>

          {/* Simple glow effect */}
          <View style={styles.glowContainer} pointerEvents="none">
            <LinearGradient
              colors={[
                'rgba(6, 182, 212, 0.3)',
                'rgba(167, 139, 250, 0.3)',
                'rgba(236, 72, 153, 0.3)',
              ]}
              style={styles.glow}
            />
          </View>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, textStyle]}>
          <Text style={styles.subtitle}>Two worlds, one atmosphere</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
  },
  logoGradient: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  glowContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    zIndex: -1,
  },
  glow: {
    flex: 1,
    borderRadius: 40,
    opacity: 0.5,
  },
  subtitleContainer: {
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
