import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Svg, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import AuraLogo from './AuraLogo';
import ParticleSystem from './ParticleSystem';
import { generateStars } from '../../utils/animationUtils';
import { STARRY_CONFIG } from '../../constants/Animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * IntroScreenRedesign - Narrative journey from separation to connection
 *
 * Story Arc:
 * Act 1 (0-2s): Two lonely worlds apart
 * Act 2 (2-4s): Logo appears as the bridge
 * Act 3 (4-6s): Energy flows connect them
 * Act 4 (6-8s): Unity - the Heartline forms
 *
 * Visual Metaphors:
 * - Two small globes = You and your partner, separate
 * - Aura logo = The app as a bridge
 * - Energy particles = Emotional connection flowing
 * - Heartline = Your shared digital atmosphere
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
    const twinkleDelay = Math.random() * 2000;
    const driftDelay = Math.random() * 1000;

    opacity.value = withDelay(
      twinkleDelay,
      withTiming(baseOpacity, { duration: 800, easing: Easing.out(Easing.ease) })
    );

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

const IntroScreenRedesign: React.FC<IntroScreenProps> = ({ onStart }) => {
  // Act 1: Two lonely globes
  const leftGlobeOpacity = useSharedValue(0);
  const leftGlobeX = useSharedValue(-100);
  const rightGlobeOpacity = useSharedValue(0);
  const rightGlobeX = useSharedValue(100);

  // Act 2: Logo appears
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoGlow = useSharedValue(0);

  // Act 3: Connection lines
  const connectionOpacity = useSharedValue(0);
  const connectionProgress = useSharedValue(0);

  // Act 4: Heartline forms
  const heartlineOpacity = useSharedValue(0);

  // Particles
  const particlesOpacity = useSharedValue(0);

  // Button
  const buttonGlow = useSharedValue(0);

  // Generate starry background
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  useEffect(() => {
    // Act 1: Globes fade in and move to position (0-2s)
    leftGlobeOpacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
    leftGlobeX.value = withTiming(0, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    rightGlobeOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      })
    );
    rightGlobeX.value = withDelay(
      200,
      withTiming(0, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Act 2: Logo appears and glows (2-4s)
    logoOpacity.value = withDelay(
      2000,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      })
    );
    logoScale.value = withDelay(
      2000,
      withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.2)),
      })
    );

    setTimeout(() => {
      logoGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 3000);

    // Act 3: Connection lines grow (4-6s)
    connectionOpacity.value = withDelay(
      4000,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );
    connectionProgress.value = withDelay(
      4000,
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // Act 4: Heartline forms (6-8s)
    heartlineOpacity.value = withDelay(
      6000,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      })
    );

    // Particles fade in (5s)
    particlesOpacity.value = withDelay(
      5000,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Button glow pulse (starts at 7s)
    setTimeout(() => {
      buttonGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 7000);
  }, []);

  // Animated styles
  const leftGlobeStyle = useAnimatedStyle(() => ({
    opacity: leftGlobeOpacity.value,
    transform: [{ translateX: leftGlobeX.value }],
  }));

  const rightGlobeStyle = useAnimatedStyle(() => ({
    opacity: rightGlobeOpacity.value,
    transform: [{ translateX: rightGlobeX.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    opacity: logoGlow.value * 0.6,
  }));

  const connectionStyle = useAnimatedStyle(() => ({
    opacity: connectionOpacity.value,
  }));

  const connectionPathProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - connectionProgress.value) * 300,
  }));

  const heartlineStyle = useAnimatedStyle(() => ({
    opacity: heartlineOpacity.value,
  }));

  const particlesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    opacity: buttonGlow.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Starry background */}
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

      {/* Main story container */}
      <View style={styles.storyContainer}>
        {/* Act 1 & 3: Two globes with connection */}
        <View style={styles.globesRow}>
          {/* Left globe (You) */}
          <Animated.View style={[styles.globeContainer, leftGlobeStyle]}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Defs>
                <RadialGradient id="leftGlow">
                  <Stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
                  <Stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </RadialGradient>
              </Defs>
              <Circle cx="30" cy="30" r="28" fill="url(#leftGlow)" opacity={0.3} />
              <Circle
                cx="30"
                cy="30"
                r="18"
                fill="rgba(6, 182, 212, 0.2)"
                stroke="rgba(6, 182, 212, 0.8)"
                strokeWidth="1.5"
              />
              <Circle cx="30" cy="30" r="3" fill="rgba(6, 182, 212, 1)" />
            </Svg>
          </Animated.View>

          {/* Center: Logo with glow */}
          <View style={styles.logoArea}>
            <Animated.View style={[styles.logoGlowRing, logoGlowStyle]} />
            <Animated.View style={[styles.logoWrapper, logoStyle]}>
              <AuraLogo size={100} animate={false} />
            </Animated.View>
          </View>

          {/* Right globe (Partner) */}
          <Animated.View style={[styles.globeContainer, rightGlobeStyle]}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Defs>
                <RadialGradient id="rightGlow">
                  <Stop offset="0%" stopColor="rgba(236, 72, 153, 0.8)" />
                  <Stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
                </RadialGradient>
              </Defs>
              <Circle cx="30" cy="30" r="28" fill="url(#rightGlow)" opacity={0.3} />
              <Circle
                cx="30"
                cy="30"
                r="18"
                fill="rgba(236, 72, 153, 0.2)"
                stroke="rgba(236, 72, 153, 0.8)"
                strokeWidth="1.5"
              />
              <Circle cx="30" cy="30" r="3" fill="rgba(236, 72, 153, 1)" />
            </Svg>
          </Animated.View>
        </View>

        {/* Act 3: Connection lines */}
        <Animated.View style={[styles.connectionLines, connectionStyle]} pointerEvents="none">
          <Svg
            width={SCREEN_WIDTH}
            height={200}
            viewBox={`0 0 ${SCREEN_WIDTH} 200`}
            style={styles.connectionSvg}
          >
            {/* Left to center */}
            <AnimatedPath
              d={`M ${SCREEN_WIDTH * 0.15} 100 Q ${SCREEN_WIDTH * 0.3} 80 ${SCREEN_WIDTH * 0.5} 100`}
              stroke="rgba(6, 182, 212, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="300"
              animatedProps={connectionPathProps}
            />
            {/* Right to center */}
            <AnimatedPath
              d={`M ${SCREEN_WIDTH * 0.85} 100 Q ${SCREEN_WIDTH * 0.7} 80 ${SCREEN_WIDTH * 0.5} 100`}
              stroke="rgba(236, 72, 153, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="300"
              animatedProps={connectionPathProps}
            />
          </Svg>
        </Animated.View>

        {/* Act 4: Heartline preview */}
        <Animated.View style={[styles.heartlinePreview, heartlineStyle]} pointerEvents="none">
          <Svg width={SCREEN_WIDTH * 0.4} height={120} viewBox={`0 0 ${SCREEN_WIDTH * 0.4} 120`}>
            <Path
              d={`M ${SCREEN_WIDTH * 0.2} 10 Q ${SCREEN_WIDTH * 0.3} 60 ${SCREEN_WIDTH * 0.2} 110`}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Narrative text */}
        <View style={styles.narrativeContainer}>
          {/* Title */}
          <Animated.View entering={FadeInUp.delay(1000).duration(1000)}>
            <Text style={styles.title}>Aura</Text>
          </Animated.View>

          {/* Story lines */}
          <Animated.View entering={FadeInUp.delay(2500).duration(1000)}>
            <Text style={styles.narrativeLine}>Two people.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(4500).duration(1000)}>
            <Text style={styles.narrativeLine}>Different skies.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(6500).duration(1000)}>
            <Text style={styles.narrativeHighlight}>One shared atmosphere.</Text>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeIn.delay(7500).duration(1000)} style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Feel your partner's weather and time,{'\n'}
              blended with yours in real-time.
            </Text>
          </Animated.View>
        </View>

        {/* CTA Button */}
        <Animated.View
          entering={FadeInUp.delay(8000).duration(1000)}
          style={styles.buttonContainer}
        >
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

        {/* Hint text */}
        <Animated.View entering={FadeIn.delay(8500).duration(1500)}>
          <Text style={styles.hintText}>Less than a minute to set up</Text>
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
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  globesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  globeContainer: {
    width: 60,
    height: 60,
  },
  logoArea: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  logoWrapper: {
    zIndex: 1,
  },
  connectionLines: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.25,
    width: SCREEN_WIDTH,
    height: 200,
  },
  connectionSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heartlinePreview: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
  },
  narrativeContainer: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 50,
  },
  title: {
    fontSize: 56,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(96, 165, 250, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    marginBottom: 8,
  },
  narrativeLine: {
    fontSize: 20,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
  },
  narrativeHighlight: {
    fontSize: 22,
    color: '#fbbf24',
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#6366f1',
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
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default IntroScreenRedesign;
