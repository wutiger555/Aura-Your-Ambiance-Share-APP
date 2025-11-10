import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

/**
 * IntroScreenPremium - High-quality intro with flowing gradient
 * v2.6.0: Premium Aura Logo animation with color flow
 *
 * Flow (3.5s total):
 * 0.0s - Background particles fade in
 * 0.3s - Logo container appears with scale
 * 0.6s - Multiple gradient layers start flowing
 * 1.0s - Glow halos pulse
 * 2.0s - "AURA" text letters appear one by one
 * 2.8s - Subtitle fades in
 * 3.5s - Complete
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const gradientLayer1Opacity = useSharedValue(0);
  const gradientLayer2Opacity = useSharedValue(0);
  const gradientLayer3Opacity = useSharedValue(0);
  const glowPulse = useSharedValue(0.5);
  const letterA1Opacity = useSharedValue(0);
  const letterU_Opacity = useSharedValue(0);
  const letterR_Opacity = useSharedValue(0);
  const letterA2Opacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);

  useEffect(() => {
    // Background and particles
    backgroundOpacity.value = withTiming(1, { duration: 800 });
    particlesOpacity.value = withDelay(
      200,
      withTiming(0.6, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );

    // Logo container appears
    logoScale.value = withDelay(
      300,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
      })
    );
    logoOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Gradient flow animation using layered opacity animation
    gradientLayer1Opacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    gradientLayer2Opacity.value = withDelay(
      1100,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    gradientLayer3Opacity.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Glow pulse (continuous, gentle breathing)
    glowPulse.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sine) }),
          withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        false
      )
    );

    // Letters appear one by one (stagger effect)
    letterA1Opacity.value = withDelay(
      2000,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    letterU_Opacity.value = withDelay(
      2150,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    letterR_Opacity.value = withDelay(
      2300,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    letterA2Opacity.value = withDelay(
      2450,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    // Subtitle
    subtitleOpacity.value = withDelay(
      2800,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Complete transition
    const timeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const gradientLayer1Style = useAnimatedStyle(() => ({
    opacity: gradientLayer1Opacity.value,
  }));

  const gradientLayer2Style = useAnimatedStyle(() => ({
    opacity: gradientLayer2Opacity.value,
  }));

  const gradientLayer3Style = useAnimatedStyle(() => ({
    opacity: gradientLayer3Opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value * 0.6,
    transform: [{ scale: 1 + glowPulse.value * 0.2 }],
  }));

  const particlesStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  // Letter styles
  const letterA1Style = useAnimatedStyle(() => ({
    opacity: letterA1Opacity.value,
    transform: [{ translateY: interpolate(letterA1Opacity.value, [0, 1], [10, 0]) }],
  }));
  const letterU_Style = useAnimatedStyle(() => ({
    opacity: letterU_Opacity.value,
    transform: [{ translateY: interpolate(letterU_Opacity.value, [0, 1], [10, 0]) }],
  }));
  const letterR_Style = useAnimatedStyle(() => ({
    opacity: letterR_Opacity.value,
    transform: [{ translateY: interpolate(letterR_Opacity.value, [0, 1], [10, 0]) }],
  }));
  const letterA2Style = useAnimatedStyle(() => ({
    opacity: letterA2Opacity.value,
    transform: [{ translateY: interpolate(letterA2Opacity.value, [0, 1], [10, 0]) }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating particles background */}
      <Animated.View style={[styles.particlesContainer, particlesStyle]}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${(i * 8.33) % 100}%`,
                top: `${(i * 13) % 100}%`,
                opacity: 0.1 + (i % 3) * 0.1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Main logo container */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.logoWrapper, logoContainerStyle]}>
          {/* Outer glow layers */}
          <Animated.View style={[styles.glowOuter, glowStyle]}>
            <BlurView intensity={20} tint="dark" style={styles.glowBlur} />
          </Animated.View>

          <Animated.View style={[styles.glowMiddle, glowStyle]}>
            <BlurView intensity={15} tint="dark" style={styles.glowBlur} />
          </Animated.View>

          {/* Logo with layered flowing gradients */}
          <View style={styles.logoGradientContainer}>
            {/* Base gradient */}
            <LinearGradient
              colors={['#06b6d4', '#a78bfa', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            />

            {/* Flowing gradient layer 1 - cyan focus */}
            <Animated.View style={[StyleSheet.absoluteFill, gradientLayer1Style]}>
              <LinearGradient
                colors={['#06b6d4', 'rgba(6, 182, 212, 0.3)', 'rgba(6, 182, 212, 0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              />
            </Animated.View>

            {/* Flowing gradient layer 2 - purple focus */}
            <Animated.View style={[StyleSheet.absoluteFill, gradientLayer2Style]}>
              <LinearGradient
                colors={['rgba(167, 139, 250, 0)', '#a78bfa', 'rgba(167, 139, 250, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              />
            </Animated.View>

            {/* Flowing gradient layer 3 - pink focus */}
            <Animated.View style={[StyleSheet.absoluteFill, gradientLayer3Style]}>
              <LinearGradient
                colors={['rgba(236, 72, 153, 0)', 'rgba(236, 72, 153, 0.3)', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              />
            </Animated.View>

            {/* Logo text content */}
            <View style={styles.logoContent}>
              <View style={styles.logoTextRow}>
                <Animated.Text style={[styles.logoLetter, letterA1Style]}>A</Animated.Text>
                <Animated.Text style={[styles.logoLetter, letterU_Style]}>U</Animated.Text>
                <Animated.Text style={[styles.logoLetter, letterR_Style]}>R</Animated.Text>
                <Animated.Text style={[styles.logoLetter, letterA2Style]}>A</Animated.Text>
              </View>
            </View>
          </View>

          {/* Inner glow */}
          <Animated.View style={[styles.glowInner, glowStyle]} pointerEvents="none">
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.3)', 'rgba(167, 139, 250, 0.3)', 'rgba(236, 72, 153, 0.3)']}
              style={styles.glowGradient}
            />
          </Animated.View>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
          <Text style={styles.subtitle}>Two worlds, one atmosphere</Text>
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
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(167, 139, 250, 0.5)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Glow layers (multiple for depth)
  glowOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  glowMiddle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
  },
  glowInner: {
    position: 'absolute',
    width: 220,
    height: 120,
    borderRadius: 20,
  },
  glowBlur: {
    flex: 1,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  glowGradient: {
    flex: 1,
    borderRadius: 20,
  },
  // Logo gradient container
  logoGradientContainer: {
    position: 'relative',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  logoContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoLetter: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  // Subtitle
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
