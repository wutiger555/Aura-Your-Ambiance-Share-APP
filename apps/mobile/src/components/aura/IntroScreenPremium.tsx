import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

const { width, height } = Dimensions.get('window');

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

/**
 * IntroScreenPremium - Professional intro with Aura logo (4s)
 * v2.6.1: Premium redesign with smooth, layered animations
 *
 * Animation phases:
 * Phase 1 (0-800ms): Entrance - glow rings + logo bounce in
 * Phase 2 (800-2200ms): Showcase - breathing + gradient rotation
 * Phase 3 (2200-3000ms): Emphasis - center pulse + ring expansion
 * Phase 4 (3000-4000ms): Transition - scale up to fullscreen + fade out
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // 6 shared values for smooth, professional animation
  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const ring1Scale = useSharedValue(1.5);
  const ring2Scale = useSharedValue(1.8);
  const rotationProgress = useSharedValue(0);

  useEffect(() => {
    // PHASE 1: Entrance (0-800ms)
    // Background fades in
    bgOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });

    // Rings bounce in from large to normal
    ring1Scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
    });
    ring2Scale.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Logo bounces in with elastic effect
    logoOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );
    logoScale.value = withDelay(
      200,
      withSequence(
        // Bounce in
        withTiming(1.15, {
          duration: 500,
          easing: Easing.out(Easing.back(1.8)),
        }),
        // PHASE 2: Breathing (800-2200ms)
        withRepeat(
          withSequence(
            withTiming(1.05, {
              duration: 700,
              easing: Easing.inOut(Easing.sine),
            }),
            withTiming(1.15, {
              duration: 700,
              easing: Easing.inOut(Easing.sine),
            })
          ),
          1, // Repeat once (2 cycles total)
          true
        ),
        // Hold at 1.1 briefly
        withTiming(1.1, { duration: 100 })
      )
    );

    // Gradient rotation for color flow (throughout showcase)
    rotationProgress.value = withDelay(
      800,
      withTiming(1, {
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // PHASE 3: Emphasis (2200-3000ms)
    // Rings pulse outward
    ring1Scale.value = withDelay(
      2200,
      withSequence(
        withTiming(1.15, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1.05, {
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
        })
      )
    );
    ring2Scale.value = withDelay(
      2200,
      withSequence(
        withTiming(1.2, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1.1, {
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
        })
      )
    );

    // PHASE 4: Transition (3000-4000ms)
    // Scale up to fullscreen
    logoScale.value = withDelay(
      3000,
      withTiming(5, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      })
    );

    // Fade out everything
    logoOpacity.value = withDelay(
      3000,
      withTiming(0, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      })
    );
    bgOpacity.value = withDelay(
      3200,
      withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.quad),
      })
    );

    // Complete at 4s
    const timeout = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotationProgress.value,
      [0, 1],
      [0, 360],
      Extrapolation.CLAMP
    );

    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const ring1Style = useAnimatedStyle(() => ({
    opacity: logoOpacity.value * 0.6,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: logoOpacity.value * 0.4,
    transform: [{ scale: ring2Scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated background gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        {/* Outer glow ring - Pink */}
        <Animated.View style={[styles.glowRing2, ring2Style]}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0)', 'rgba(236, 72, 153, 0.2)', 'rgba(236, 72, 153, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringGradient}
          />
        </Animated.View>

        {/* Inner glow ring - Purple */}
        <Animated.View style={[styles.glowRing1, ring1Style]}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.3)', 'rgba(167, 139, 250, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringGradient}
          />
        </Animated.View>

        {/* Aura Logo with rotation */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <AuraLogo size={240} animate={false} />
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
  logoContainer: {
    position: 'relative',
    zIndex: 10,
  },
  glowRing1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    zIndex: 5,
  },
  glowRing2: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    zIndex: 3,
  },
  ringGradient: {
    flex: 1,
    borderRadius: 999,
  },
});
