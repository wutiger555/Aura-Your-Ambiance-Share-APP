import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Svg,
  Path,
  Circle,
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { generateStars } from '../../utils/animationUtils';
import { STARRY_CONFIG, MARKER_CONFIG } from '../../constants/Animations';
import { useLocationStore } from '../../stores/useLocationStore';
import MinimalistWorldMap from './MinimalistWorldMap';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * ConnectionIntroRedesign - Enhanced journey bridging Intro Screen to Main Screen
 *
 * Design Philosophy:
 * - Continues the "two globes" narrative from IntroScreen
 * - Transforms abstract globes into real-world map locations
 * - Introduces breathing connection (preview of Heartline)
 * - Transitions through day/night cycle based on actual weather
 *
 * Story Arc (10 seconds):
 * Act 1 (0-2s):   Two globes pulse in, same as Intro Screen
 * Act 2 (2-4s):   Globe colors shift to match current weather/time
 * Act 3 (4-6s):   World map emerges behind globes, cities marked
 * Act 4 (6-8s):   Heartline forms between them with breathing pulse
 * Act 5 (8-10s):  Everything fades into blended sky gradient
 */

const ConnectionIntroRedesign: React.FC = () => {
  const { myLocation, partnerLocation } = useLocationStore();

  // Master timeline
  const masterProgress = useSharedValue(0);

  // Generate stars
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT * 0.8, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  // Globe positions
  const leftGlobeX = SCREEN_WIDTH * 0.25;
  const leftGlobeY = SCREEN_HEIGHT * 0.35;
  const rightGlobeX = SCREEN_WIDTH * 0.75;
  const rightGlobeY = SCREEN_HEIGHT * 0.65;

  // Map coordinates
  const latLongToMapCoords = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 360;
    const y = ((90 - lat) / 180) * 180;
    return { x, y };
  };

  const myMapPos = myLocation
    ? latLongToMapCoords(myLocation.latitude, myLocation.longitude)
    : { x: 100, y: 60 };

  const partnerMapPos = partnerLocation
    ? latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude)
    : { x: 260, y: 120 };

  useEffect(() => {
    // 10 second journey
    masterProgress.value = withTiming(1, {
      duration: 10000,
      easing: Easing.inOut(Easing.cubic),
    });
  }, []);

  // Act 1: Globes appear (0-0.2)
  const leftGlobeStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const appearProgress = interpolate(progress, [0, 0.2], [0, 1], 'clamp');

    // Fade out at end
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    const opacity = appearProgress * fadeOut;
    const scale = interpolate(appearProgress, [0, 1], [0.3, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightGlobeStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const appearProgress = interpolate(progress, [0.05, 0.25], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    const opacity = appearProgress * fadeOut;
    const scale = interpolate(appearProgress, [0, 1], [0.3, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Globe breathing pulse (starts after appearance)
  const globePulse = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      globePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }, 2000);
  }, []);

  const globePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + globePulse.value * 0.1 }],
    opacity: 0.5 + globePulse.value * 0.3,
  }));

  // Act 3: World map emerges (0.4-0.6)
  const worldMapStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const mapProgress = interpolate(progress, [0.4, 0.6], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    const opacity = mapProgress * 0.6 * fadeOut;
    const scale = interpolate(mapProgress, [0, 1], [0.7, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Act 3: City markers (0.5-0.65)
  const cityMarkersProps = useAnimatedProps(() => {
    const progress = masterProgress.value;
    const markerProgress = interpolate(progress, [0.5, 0.65], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    return {
      opacity: markerProgress * fadeOut,
    };
  });

  // Act 4: Heartline formation (0.6-0.8)
  const heartlineProgress = useSharedValue(0);

  useEffect(() => {
    heartlineProgress.value = withDelay(
      6000,
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.cubic),
      })
    );
  }, []);

  const heartlineStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const lineProgress = interpolate(progress, [0.6, 0.8], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.85, 1], [1, 0], 'clamp');

    return {
      opacity: lineProgress * fadeOut,
    };
  });

  // Heartline path (curved, like main screen)
  const centerX = SCREEN_WIDTH / 2;
  const curveControlX = SCREEN_WIDTH * 0.65;
  const heartlinePath = `M ${leftGlobeX} ${leftGlobeY} Q ${curveControlX} ${SCREEN_HEIGHT / 2} ${rightGlobeX} ${rightGlobeY}`;
  const heartlineLength = Math.sqrt(
    Math.pow(rightGlobeX - leftGlobeX, 2) + Math.pow(rightGlobeY - leftGlobeY, 2)
  ) * 1.3;

  const heartlinePathProps = useAnimatedProps(() => {
    const lineProgress = heartlineProgress.value;
    return {
      strokeDashoffset: heartlineLength * (1 - lineProgress),
    };
  });

  // Heartline breathing pulse
  const heartlinePulse = useSharedValue(0.5);

  useEffect(() => {
    setTimeout(() => {
      heartlinePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }, 7000);
  }, []);

  const heartlinePulseProps = useAnimatedProps(() => ({
    strokeOpacity: heartlinePulse.value,
  }));

  // Act 5: Final transition gradient (0.8-1)
  const finalGradientStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const gradientProgress = interpolate(progress, [0.8, 1], [0, 1], 'clamp');

    return {
      opacity: gradientProgress,
    };
  });

  // Text animations
  const titleStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const textProgress = interpolate(progress, [0.3, 0.5], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.75, 0.9], [1, 0], 'clamp');

    const opacity = textProgress * fadeOut;
    const translateY = interpolate(textProgress, [0, 1], [20, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const subtitleStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const textProgress = interpolate(progress, [0.5, 0.7], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.75, 0.9], [1, 0], 'clamp');

    const opacity = textProgress * fadeOut;
    const translateY = interpolate(textProgress, [0, 1], [20, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Stars fade out
  const starsStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    return {
      opacity: interpolate(progress, [0, 0.4, 0.9], [0.5, 0.2, 0], 'clamp'),
    };
  });

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars */}
      <Animated.View style={[StyleSheet.absoluteFill, starsStyle]}>
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity * 0.8,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* World map layer */}
      <Animated.View style={[styles.mapLayer, worldMapStyle]}>
        <MinimalistWorldMap
          width={SCREEN_WIDTH * 0.95}
          height={(SCREEN_WIDTH * 0.95) / 2}
          strokeColor="rgba(255, 255, 255, 0.3)"
          strokeWidth={1}
        />

        {/* City markers on map */}
        <Svg
          width={SCREEN_WIDTH * 0.95}
          height={(SCREEN_WIDTH * 0.95) / 2}
          viewBox="0 0 360 180"
          style={StyleSheet.absoluteFill}
        >
          <AnimatedG animatedProps={cityMarkersProps}>
            {/* My city */}
            <Circle
              cx={myMapPos.x}
              cy={myMapPos.y}
              r={4}
              fill={MARKER_CONFIG.MY_COLOR}
              opacity={0.8}
            />
            <Circle
              cx={myMapPos.x}
              cy={myMapPos.y}
              r={8}
              fill="none"
              stroke={MARKER_CONFIG.MY_COLOR}
              strokeWidth={1.5}
              opacity={0.4}
            />

            {/* Partner city */}
            <Circle
              cx={partnerMapPos.x}
              cy={partnerMapPos.y}
              r={4}
              fill={MARKER_CONFIG.PARTNER_COLOR}
              opacity={0.8}
            />
            <Circle
              cx={partnerMapPos.x}
              cy={partnerMapPos.y}
              r={8}
              fill="none"
              stroke={MARKER_CONFIG.PARTNER_COLOR}
              strokeWidth={1.5}
              opacity={0.4}
            />
          </AnimatedG>
        </Svg>
      </Animated.View>

      {/* Two globes (same as Intro Screen) */}
      <Animated.View
        style={[
          styles.globeContainer,
          { left: leftGlobeX - 40, top: leftGlobeY - 40 },
          leftGlobeStyle,
        ]}
      >
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Defs>
            <SvgRadialGradient id="leftGlow">
              <Stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
              <Stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </SvgRadialGradient>
          </Defs>
          <Animated.View style={globePulseStyle}>
            <Circle cx="40" cy="40" r="35" fill="url(#leftGlow)" opacity={0.4} />
          </Animated.View>
          <Circle
            cx="40"
            cy="40"
            r="22"
            fill="rgba(6, 182, 212, 0.2)"
            stroke="rgba(6, 182, 212, 0.9)"
            strokeWidth="2"
          />
          <Circle cx="40" cy="40" r="4" fill="rgba(6, 182, 212, 1)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.globeContainer,
          { left: rightGlobeX - 40, top: rightGlobeY - 40 },
          rightGlobeStyle,
        ]}
      >
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Defs>
            <SvgRadialGradient id="rightGlow">
              <Stop offset="0%" stopColor="rgba(236, 72, 153, 0.8)" />
              <Stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
            </SvgRadialGradient>
          </Defs>
          <Animated.View style={globePulseStyle}>
            <Circle cx="40" cy="40" r="35" fill="url(#rightGlow)" opacity={0.4} />
          </Animated.View>
          <Circle
            cx="40"
            cy="40"
            r="22"
            fill="rgba(236, 72, 153, 0.2)"
            stroke="rgba(236, 72, 153, 0.9)"
            strokeWidth="2"
          />
          <Circle cx="40" cy="40" r="4" fill="rgba(236, 72, 153, 1)" />
        </Svg>
      </Animated.View>

      {/* Heartline connection */}
      <Animated.View style={[StyleSheet.absoluteFill, heartlineStyle]} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          {/* Main breathing line */}
          <AnimatedPath
            d={heartlinePath}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={heartlineLength}
            animatedProps={{
              ...heartlinePathProps,
              ...heartlinePulseProps,
            }}
          />
          {/* Outer glow */}
          <AnimatedPath
            d={heartlinePath}
            stroke="rgba(96, 165, 250, 0.3)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={heartlineLength}
            animatedProps={heartlinePathProps}
            opacity={0.5}
          />
        </Svg>
      </Animated.View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Weaving Your Connection</Text>
        </Animated.View>
        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>
            {myLocation?.name} ✦ {partnerLocation?.name}
          </Text>
        </Animated.View>
      </View>

      {/* Final transition gradient (fades in to match main screen) */}
      <Animated.View style={[StyleSheet.absoluteFill, finalGradientStyle]}>
        <LinearGradient
          colors={['#1e293b', '#312e81', '#1e1b4b']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
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
  mapLayer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
  },
});

export default ConnectionIntroRedesign;
