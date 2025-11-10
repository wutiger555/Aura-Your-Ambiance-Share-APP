import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

/**
 * IntroScreenPremium - Memory-optimized professional intro (4s)
 * v2.6.4: CRITICAL FIX - AuraLogo with animate={false}
 *
 * Optimizations:
 * - Only 3 shared values (logoScale, logoOpacity, glowOpacity)
 * - AuraLogo with animate={false} creates NO additional shared values
 * - NO withRepeat (manual breathing with withSequence)
 * - Simplified animation chains
 * - Static glow rings (no independent scaling)
 *
 * Animation Flow:
 * Phase 1 (0-600ms): Logo bounces in
 * Phase 2 (600-2600ms): Two breathing cycles (manual)
 * Phase 3 (2600-4000ms): Scale up + fade out
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // Only 3 shared values for minimal memory usage
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo fade in
    logoOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    // Glow fade in (delayed)
    glowOpacity.value = withDelay(
      150,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Logo animation sequence (no withRepeat!)
    logoScale.value = withSequence(
      // Phase 1: Bounce in (0-600ms)
      withTiming(1.15, {
        duration: 500,
        easing: Easing.out(Easing.back(1.6)),
      }),
      // Phase 2: Manual breathing - cycle 1 (600-1600ms)
      withTiming(1.08, {
        duration: 500,
        easing: Easing.inOut(Easing.sine),
      }),
      withTiming(1.15, {
        duration: 500,
        easing: Easing.inOut(Easing.sine),
      }),
      // Breathing cycle 2 (1600-2600ms)
      withTiming(1.08, {
        duration: 500,
        easing: Easing.inOut(Easing.sine),
      }),
      withTiming(1.15, {
        duration: 500,
        easing: Easing.inOut(Easing.sine),
      }),
      // Phase 3: Scale up for transition (2600-4000ms)
      withDelay(
        200,
        withTiming(6, {
          duration: 1200,
          easing: Easing.in(Easing.cubic),
        })
      )
    );

    // Fade out at the end
    setTimeout(() => {
      logoOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.cubic),
      });
      glowOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.cubic),
      });
    }, 3200);

    // Complete animation
    const timeout = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Static background gradient */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Static glow rings (only opacity animation, no scaling) */}
        <Animated.View style={[styles.outerGlow, glowStyle]}>
          <View style={styles.outerGlowInner} />
        </Animated.View>

        <Animated.View style={[styles.innerGlow, glowStyle]}>
          <View style={styles.innerGlowInner} />
        </Animated.View>

        {/* Aura Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <AuraLogo size={200} animate={false} />
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
    width: 280,
    height: 280,
    borderRadius: 140,
    zIndex: 5,
  },
  innerGlowInner: {
    flex: 1,
    borderRadius: 140,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
  },
  outerGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    zIndex: 3,
  },
  outerGlowInner: {
    flex: 1,
    borderRadius: 180,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
});
