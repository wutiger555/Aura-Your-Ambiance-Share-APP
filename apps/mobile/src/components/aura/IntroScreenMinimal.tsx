import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface IntroScreenMinimalProps {
  onComplete: () => void;
}

/**
 * IntroScreenMinimal - Extreme simplification (2-3s)
 * v2.6.0: Fast, elegant intro with Aura storytelling
 *
 * Flow:
 * 0.0s - Start: Two particles appear (cyan/pink)
 * 0.5s - Particles move toward center
 * 1.2s - Aura logo fades in
 * 1.8s - Subtitle appears: "Connecting your worlds"
 * 2.5s - Complete transition
 */
export default function IntroScreenMinimal({ onComplete }: IntroScreenMinimalProps) {
  // Animation values
  const leftParticleX = useSharedValue(-100);
  const rightParticleX = useSharedValue(100);
  const particlesOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    // Act 1: Particles appear and move (0-1.2s)
    particlesOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    leftParticleX.value = withDelay(
      200,
      withTiming(-20, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    rightParticleX.value = withDelay(
      200,
      withTiming(20, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Act 2: Logo emerges (1.2s-1.8s)
    logoOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );

    logoScale.value = withDelay(
      1000,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
      })
    );

    // Act 3: Subtitle appears (1.8s-2.3s)
    subtitleOpacity.value = withDelay(
      1600,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Complete at 2.5s
    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  // Particle animations
  const leftParticleStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
    transform: [{ translateX: leftParticleX.value }],
  }));

  const rightParticleStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
    transform: [{ translateX: rightParticleX.value }],
  }));

  // Logo animations
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  // Subtitle animation
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0a0118', '#1e1b4b', '#312e81']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Particles */}
      <View style={styles.particlesContainer}>
        <Animated.View style={[styles.particle, styles.particleCyan, leftParticleStyle]}>
          <View style={styles.particleGlow} />
        </Animated.View>

        <Animated.View style={[styles.particle, styles.particlePink, rightParticleStyle]}>
          <View style={styles.particleGlow} />
        </Animated.View>
      </View>

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
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
        <Text style={styles.subtitle}>Connecting your worlds</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Particles
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleCyan: {
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  particlePink: {
    backgroundColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  particleGlow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  // Logo
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 8,
  },
  // Subtitle
  subtitleContainer: {
    position: 'absolute',
    bottom: 100,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});
