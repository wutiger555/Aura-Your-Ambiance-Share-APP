import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import AuraLogo from './AuraLogo';
import ParticleSystem from './ParticleSystem';
import { ANIMATION_DURATIONS, STARRY_CONFIG } from '../../constants/Animations';
import { generateStars } from '../../utils/animationUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * AnimatedStar - Individual star with twinkling and drifting
 */
interface AnimatedStarProps {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
}

const AnimatedStar: React.FC<AnimatedStarProps> = ({ x, y, size, baseOpacity }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Randomized delays for natural effect
    const twinkleDelay = Math.random() * 2000;
    const driftDelay = Math.random() * 1000;

    // Fade in initially
    opacity.value = withDelay(
      twinkleDelay,
      withTiming(baseOpacity, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    // Continuous twinkling (opacity variation)
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(baseOpacity * 0.3, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(baseOpacity, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    }, twinkleDelay + 800);

    // Gentle vertical drift
    setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-15, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        false
      );
    }, driftDelay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
};

interface IntroScreenProps {
  onStart: () => void;
}

/**
 * IntroScreen - Cinematic opening experience
 *
 * Design Philosophy:
 * - Immersive starry atmosphere that draws users in
 * - Logo emerges like a celestial body
 * - Copy flows like poetry, emphasizing emotional connection
 * - Subtle animations create anticipation
 *
 * Animation Sequence:
 * 0-1s:     Stars twinkle into existence
 * 0.5-2s:   Logo fades in with gentle scale
 * 1.5-3s:   Title appears with upward drift
 * 2-3.5s:   Subtitle flows in
 * 2.5-4s:   Description reveals
 * 3s-4.5s:  Button appears with ripple effect
 */
const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const particlesOpacity = useSharedValue(0);
  const buttonGlow = useSharedValue(0);

  // Generate starry background
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  useEffect(() => {
    // Logo entrance (0.5-2s)
    logoOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );

    logoScale.value = withDelay(
      500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.back(1.2)),
      })
    );

    // Particles fade in (1-2.5s)
    particlesOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Button glow pulse (starts at 3s, infinite)
    setTimeout(() => {
      buttonGlow.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Infinite
        false
      );
    }, 3000);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const particlesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    opacity: buttonGlow.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      {/* Gradient background - deep space to twilight */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated starry background with twinkling and drifting */}
      <View style={StyleSheet.absoluteFill}>
        {stars.map((star) => (
          <AnimatedStar
            key={star.id}
            x={star.x}
            y={star.y}
            size={star.size}
            baseOpacity={star.opacity * 0.8}
          />
        ))}
      </View>

      {/* Floating particles */}
      <Animated.View style={[StyleSheet.absoluteFill, particlesAnimatedStyle]}>
        <ParticleSystem count={6} />
      </Animated.View>

      {/* Content container */}
      <View style={styles.content}>
        {/* Logo with entrance animation */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <AuraLogo size={140} animate={false} />
        </Animated.View>

        {/* Title - appears with upward drift */}
        <Animated.View entering={FadeInUp.delay(1500).duration(1000)}>
          <Text style={styles.title}>Aura</Text>
        </Animated.View>

        {/* Subtitle - flows in after title */}
        <Animated.View entering={FadeInUp.delay(2000).duration(1000)}>
          <Text style={styles.subtitle}>Share the sky between you</Text>
        </Animated.View>

        {/* Description - reveals with gentle fade */}
        <Animated.View
          entering={FadeInUp.delay(2500).duration(1000)}
          style={styles.descriptionContainer}
        >
          <Text style={styles.description}>
            Your real-time weather and time,{'\n'}
            blended into a shared atmosphere.{'\n'}
            No matter the distance.
          </Text>
        </Animated.View>

        {/* CTA Button with glow effect */}
        <Animated.View
          entering={FadeInUp.delay(3000).duration(1000)}
          style={styles.buttonContainer}
        >
          {/* Glow ring */}
          <Animated.View style={[styles.buttonGlow, buttonGlowStyle]} />

          <TouchableOpacity
            style={styles.startButton}
            onPress={onStart}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Weave Your Connection</Text>
            <ArrowRight size={22} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>

        {/* Subtle hint text */}
        <Animated.View entering={FadeIn.delay(3500).duration(1500)}>
          <Text style={styles.hintText}>Takes less than a minute</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: SCREEN_HEIGHT * 0.1,
    paddingBottom: SCREEN_HEIGHT * 0.15,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(96, 165, 250, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 22,
    color: '#cbd5e1', // slate-300
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginBottom: 50,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
  buttonContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  buttonGlow: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: 16,
    backgroundColor: '#60A5FA',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -155 }, { translateY: -28 }],
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1', // indigo-500
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#64748b', // slate-500
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default IntroScreen;
