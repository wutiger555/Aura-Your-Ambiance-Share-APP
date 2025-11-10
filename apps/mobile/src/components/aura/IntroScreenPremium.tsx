import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

// Aura Logo SVG with dynamic gradient
const AURA_LOGO = `
<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="auraGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#FDE68A;"/>
      <stop offset="30%" style="stop-color:#FBCFE8;"/>
      <stop offset="55%" style="stop-color:#C7D2FE;"/>
      <stop offset="100%" style="stop-color:#60A5FA;"/>
    </linearGradient>
    <filter id="sunGlow">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <g transform="rotate(-90 50 50)">
    <circle cx="50" cy="50" r="48" style="fill:none; stroke:rgba(255, 255, 255, 0.5); stroke-width:1;"/>
    <circle cx="50" cy="50" r="45" style="fill:none; stroke:rgba(255, 255, 255, 0.2); stroke-width:0.5;"/>
  </g>

  <circle cx="50" cy="50" r="45" style="fill:url(#auraGradient);"/>
  <circle cx="50" cy="50" r="5" style="fill:#fefce8; filter:url(#sunGlow);"/>
</svg>
`;

/**
 * IntroScreenPremium - Modern intro with actual Aura logo (3.5s)
 * v2.6.0: Premium redesign with gradient flow animation
 *
 * Animation sequence:
 * 1. Logo fades in and scales up (0-600ms)
 * 2. Gradient rotates creating flow effect (600-2400ms)
 * 3. Center glow pulses (2400-2800ms)
 * 4. Logo scales up to full screen and fades out (2800-3300ms)
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // Only 4 shared values for memory efficiency
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoRotation = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    // 1. Fade in + scale up (0-600ms)
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic)
    });

    logoScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.2))
    });

    // 2. Rotate gradient for flow effect (600-2400ms)
    logoRotation.value = withDelay(
      600,
      withTiming(360, {
        duration: 1800,
        easing: Easing.inOut(Easing.cubic)
      })
    );

    // 3. Center glow pulse (2400-2800ms)
    glowScale.value = withDelay(
      2400,
      withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) })
      )
    );

    // 4. Scale up to full screen + fade out (2800-3300ms)
    logoScale.value = withDelay(
      2800,
      withTiming(4, {
        duration: 500,
        easing: Easing.in(Easing.cubic)
      })
    );

    logoOpacity.value = withDelay(
      2800,
      withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.cubic)
      })
    );

    // Complete at 3.3s
    const timeout = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => clearTimeout(timeout);
  }, []);

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
      locations={[0, 0.35, 0.65, 1]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated glow rings */}
        <Animated.View style={[styles.glowRing1, glowStyle]} />
        <Animated.View style={[styles.glowRing2, glowStyle]} />

        {/* Aura Logo */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <SvgXml xml={AURA_LOGO} width={200} height={200} />
        </Animated.View>
      </View>
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
    zIndex: 10,
  },
  glowRing1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    zIndex: 1,
  },
  glowRing2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    zIndex: 0,
  },
});
