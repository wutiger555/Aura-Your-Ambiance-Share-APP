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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

const { width, height } = Dimensions.get('window');

interface IntroScreenPremiumProps {
  onComplete: () => void;
}

/**
 * IntroScreenPremium - Redesigned modern intro (4s)
 * v2.6.2: Complete rebuild with proven working patterns
 *
 * Animation Flow:
 * Phase 1 (0-800ms): Logo bounces in with glow rings
 * Phase 2 (800-2400ms): Breathing animation - logo pulses gently
 * Phase 3 (2400-3000ms): Emphasis - synchronized expansion
 * Phase 4 (3000-4000ms): Scale up + fade to next screen
 */
export default function IntroScreenPremium({ onComplete }: IntroScreenPremiumProps) {
  // Core animation values (5 shared values total)
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const innerGlowScale = useSharedValue(0.8);
  const outerGlowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // PHASE 1: Entrance (0-800ms)
    // Logo appears with elastic bounce
    logoOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    logoScale.value = withSequence(
      withTiming(1.2, {
        duration: 500,
        easing: Easing.out(Easing.back(1.7)),
      }),
      // PHASE 2: Breathing (800-2400ms)
      withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 800,
            easing: Easing.inOut(Easing.sine),
          }),
          withTiming(1.2, {
            duration: 800,
            easing: Easing.inOut(Easing.sine),
          })
        ),
        1, // Repeat once (one full breath cycle)
        true
      ),
      // PHASE 3: Emphasis (2400-3000ms)
      withTiming(1.25, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Glow rings animate with logo
    glowOpacity.value = withDelay(
      100,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    innerGlowScale.value = withDelay(
      200,
      withSequence(
        withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
        }),
        // Breathing with logo
        withRepeat(
          withSequence(
            withTiming(0.95, {
              duration: 800,
              easing: Easing.inOut(Easing.sine),
            }),
            withTiming(1.05, {
              duration: 800,
              easing: Easing.inOut(Easing.sine),
            })
          ),
          1,
          true
        )
      )
    );

    outerGlowScale.value = withDelay(
      300,
      withSequence(
        withTiming(1, {
          duration: 700,
          easing: Easing.out(Easing.back(1.5)),
        }),
        // Breathing with logo
        withRepeat(
          withSequence(
            withTiming(0.95, {
              duration: 800,
              easing: Easing.inOut(Easing.sine),
            }),
            withTiming(1.05, {
              duration: 800,
              easing: Easing.inOut(Easing.sine),
            })
          ),
          1,
          true
        )
      )
    );

    // PHASE 4: Transition (3000-4000ms)
    setTimeout(() => {
      // Scale up to fill screen
      logoScale.value = withTiming(6, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      });

      innerGlowScale.value = withTiming(8, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      });

      outerGlowScale.value = withTiming(10, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      });

      // Fade out
      logoOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.cubic),
      });

      glowOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.cubic),
      });
    }, 3000);

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

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.4,
    transform: [{ scale: innerGlowScale.value }],
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.25,
    transform: [{ scale: outerGlowScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Outer glow ring (Pink) */}
        <Animated.View style={[styles.outerGlow, outerGlowStyle]}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0)', 'rgba(236, 72, 153, 0.3)', 'rgba(236, 72, 153, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Inner glow ring (Purple) */}
        <Animated.View style={[styles.innerGlow, innerGlowStyle]}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.4)', 'rgba(167, 139, 250, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glowGradient}
          />
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
  outerGlow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    zIndex: 3,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 999,
  },
});
