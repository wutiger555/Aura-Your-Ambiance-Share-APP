import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuraLogo from './AuraLogo';

interface IntroScreenStaticProps {
  onComplete: () => void;
}

/**
 * IntroScreenStatic - ZERO ANIMATION emergency fallback
 * v2.6.5: For iOS Simulators with extremely strict memory limits
 *
 * NO shared values, NO animations, NO Reanimated
 * Just static logo display for 2 seconds
 *
 * This is a diagnostic version to isolate whether the crash is
 * animation-related or something else entirely.
 */
export default function IntroScreenStatic({ onComplete }: IntroScreenStaticProps) {
  useEffect(() => {
    // Simple timeout, no animations
    const timeout = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

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
        {/* Static glow rings (no animation) */}
        <View style={styles.outerGlow}>
          <View style={styles.outerGlowInner} />
        </View>

        <View style={styles.innerGlow}>
          <View style={styles.innerGlowInner} />
        </View>

        {/* Aura Logo (pure static) */}
        <View style={styles.logoWrapper}>
          <AuraLogo size={200} />
        </View>
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
    opacity: 1,
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
    opacity: 1,
  },
  outerGlowInner: {
    flex: 1,
    borderRadius: 180,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
});
