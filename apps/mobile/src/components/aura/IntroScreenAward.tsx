import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Svg, Circle, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IntroScreenAwardProps {
  onComplete: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * IntroScreenAward - iOS Design Award Worthy Intro
 * v2.7.0: Premium, minimal, with continuous animations
 *
 * Design Philosophy:
 * - Inspired by Apple Design Award winners (Calm, Headspace, Loona)
 * - Continuous subtle breathing animations
 * - Interactive, living logo
 * - Extreme minimalism - let the logo breathe
 * - No text clutter - just pure atmosphere
 * - Gradient particles that float endlessly
 */
export default function IntroScreenAward({ onComplete }: IntroScreenAwardProps) {
  // Logo breathing animation (4s cycle)
  const logoBreath = useSharedValue(0);

  // Orbital rings rotation (ultra-slow, 60s per rotation)
  const ringRotation = useSharedValue(0);

  // Gradient shift animation (20s cycle)
  const gradientShift = useSharedValue(0);

  // Particles floating
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);

  useEffect(() => {
    // Logo breathing (gentle scale pulsing)
    logoBreath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Ultra-slow ring rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );

    // Gradient color shift
    gradientShift.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // Floating particles (staggered)
    particle1Y.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    particle2Y.value = withDelay(
      2000,
      withRepeat(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    particle3Y.value = withDelay(
      4000,
      withRepeat(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Auto-complete after 3.5 seconds (enough to appreciate the beauty)
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Logo breathing style
  const logoStyle = useAnimatedStyle(() => {
    const scale = interpolate(logoBreath.value, [0, 1], [1, 1.08]);
    const opacity = interpolate(logoBreath.value, [0, 1], [0.92, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Ring rotation style
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  // Gradient background color interpolation
  const backgroundStyle = useAnimatedStyle(() => {
    const progress = gradientShift.value;
    // Subtle color breathing in the background
    return {
      opacity: interpolate(progress, [0, 0.5, 1], [0.9, 1, 0.9]),
    };
  });

  // Particle animations
  const particle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle1Y.value, [0, 1], [-40, 40]) },
      { translateX: interpolate(particle1Y.value, [0, 0.5, 1], [0, 10, 0]) },
    ],
    opacity: interpolate(particle1Y.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle2Y.value, [0, 1], [-60, 60]) },
      { translateX: interpolate(particle2Y.value, [0, 0.5, 1], [0, -15, 0]) },
    ],
    opacity: interpolate(particle2Y.value, [0, 0.5, 1], [0.2, 0.5, 0.2]),
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle3Y.value, [0, 1], [-50, 50]) },
      { translateX: interpolate(particle3Y.value, [0, 0.5, 1], [0, 12, 0]) },
    ],
    opacity: interpolate(particle3Y.value, [0, 0.5, 1], [0.25, 0.55, 0.25]),
  }));

  return (
    <View style={styles.container}>
      {/* Animated gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating particles - subtle ambiance */}
      <Animated.View style={[styles.particle, styles.particle1, particle1Style]} />
      <Animated.View style={[styles.particle, styles.particle2, particle2Style]} />
      <Animated.View style={[styles.particle, styles.particle3, particle3Style]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Outer glow rings (static for elegance) */}
        <View style={styles.glowRings}>
          <View style={[styles.glowRing, styles.outerRing]} />
          <View style={[styles.glowRing, styles.middleRing]} />
          <View style={[styles.glowRing, styles.innerRing]} />
        </View>

        {/* Breathing logo with orbital rings */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          {/* Orbital rings - ultra-slow rotation */}
          <Animated.View style={[styles.orbitalRings, ringStyle]}>
            <Svg width={280} height={280} style={styles.orbitalSvg}>
              <Defs>
                <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                  <Stop offset="50%" stopColor="rgba(147, 51, 234, 0.3)" />
                  <Stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
                </SvgGradient>
              </Defs>
              <G>
                {/* Outer orbital ring */}
                <Circle
                  cx="140"
                  cy="140"
                  r="130"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="1"
                  strokeDasharray="4,8"
                  opacity={0.4}
                />
                {/* Inner orbital ring */}
                <Circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="0.5"
                  strokeDasharray="2,6"
                  opacity={0.3}
                />
              </G>
            </Svg>
          </Animated.View>

          {/* Aura Logo SVG */}
          <Svg width={180} height={180} viewBox="0 0 100 100" style={styles.logo}>
            <Defs>
              <SvgGradient id="auraGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <Stop offset="0%" stopColor="#FDE68A" />
                <Stop offset="30%" stopColor="#FBCFE8" />
                <Stop offset="55%" stopColor="#C7D2FE" />
                <Stop offset="100%" stopColor="#60A5FA" />
              </SvgGradient>
            </Defs>
            <G>
              {/* Background rings */}
              <Circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="0.5"
              />
              <Circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.3"
              />
              {/* Main logo circle */}
              <Circle cx="50" cy="50" r="42" fill="url(#auraGradient)" opacity={0.95} />
              {/* Center dot - the "connection point" */}
              <Circle cx="50" cy="50" r="4.5" fill="#fefce8" opacity={0.9} />
            </G>
          </Svg>
        </Animated.View>

        {/* Minimal text - only brand name, no clutter */}
        <Animated.View style={[styles.textContainer, logoStyle]}>
          <Text style={styles.brandName}>Aura</Text>
          <View style={styles.subtitleDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Glow rings (static, for elegance)
  glowRings: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  outerRing: {
    width: 420,
    height: 420,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.08)',
  },
  middleRing: {
    width: 340,
    height: 340,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
  },
  innerRing: {
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.08)',
  },

  // Logo and orbital system
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  orbitalRings: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitalSvg: {
    position: 'absolute',
  },
  logo: {
    zIndex: 2,
    // Subtle drop shadow for depth
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  // Minimal text
  textContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 40,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 8,
    marginBottom: 16,
  },
  subtitleDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(6, 182, 212, 0.5)',
  },

  // Floating particles
  particle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
  },
  particle1: {
    width: 100,
    height: 100,
    top: '20%',
    left: '15%',
    shadowColor: '#a78bfa',
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  particle2: {
    width: 140,
    height: 140,
    top: '55%',
    right: '10%',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  particle3: {
    width: 80,
    height: 80,
    bottom: '25%',
    left: '20%',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    shadowColor: '#ec4899',
    shadowOpacity: 0.35,
    shadowRadius: 25,
  },
});
