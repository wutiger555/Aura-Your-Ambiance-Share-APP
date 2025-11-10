import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import AuraLogo from './AuraLogo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IntroScreenLottieProps {
  onComplete: () => void;
}

/**
 * IntroScreenLottie - Premium intro animation using Lottie
 * v2.6.5: High-quality animations without Reanimated memory overhead
 *
 * Why Lottie:
 * - Pre-rendered JSON animations (no runtime calculations)
 * - NO shared values, NO worklets, NO memory overhead
 * - Professional animations from LottieFiles.com
 * - Smooth 60fps on all devices including simulators
 * - Works with complex animations that would crash in Reanimated
 *
 * How to add custom animations:
 * 1. Download from https://lottiefiles.com (search: "connection", "world", "globe", "network")
 * 2. Place JSON in apps/mobile/assets/lottie/
 * 3. Import: require('../../assets/lottie/your-animation.json')
 * 4. Replace animationSource prop below
 */
export default function IntroScreenLottie({ onComplete }: IntroScreenLottieProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Play animation automatically
    animationRef.current?.play();

    // Complete after animation finishes (adjust timing as needed)
    const timeout = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 seconds for Lottie animation + fade

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Glow rings */}
        <View style={styles.glowContainer}>
          <View style={styles.outerGlow} />
          <View style={styles.innerGlow} />
        </View>

        {/* Lottie Breathing Animation - Behind Logo */}
        <View style={styles.lottieContainer}>
          <LottieView
            ref={animationRef}
            source={require('../../assets/lottie/aura-breathing.json')}
            style={styles.lottieAnimation}
            loop={true}
            autoPlay={true}
            speed={0.7}
          />
        </View>

        {/* Aura Logo - Centered */}
        <View style={styles.logoWrapper}>
          <AuraLogo size={180} />
        </View>

        {/*
          To replace with custom Lottie animation:
          1. Download from LottieFiles.com (search: "connection", "world", "network", "love")
          2. Place JSON in apps/mobile/assets/lottie/
          3. Update require() path above
          4. Adjust speed prop (0.5 = slower, 2.0 = faster)
        */}
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

  // Glow effects
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  innerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },

  // Logo
  logoWrapper: {
    zIndex: 10,
    position: 'absolute',
  },

  // Lottie animation
  lottieContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 500,
    height: 500,
  },
});
