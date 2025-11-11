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
  cancelAnimation,
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
import { STARRY_CONFIG, MARKER_CONFIG, ANIMATION_DURATIONS } from '../../constants/Animations';
import { useLocationStore } from '../../stores/useLocationStore';
import MinimalistWorldMap from './MinimalistWorldMap';
import AuraLogo from './AuraLogo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * ConnectionIntroRedesign - Logo-centric bridging journey
 * v2.7.0: Redesigned with Aura Logo as the unifying element
 *
 * Design Philosophy:
 * - Logo emerges as the connecting force between two locations
 * - Energy flows FROM the logo TO the locations (top-down energy)
 * - Seamless transition from abstract globes to real-world map
 * - Logo breathing symbolizes the living connection
 *
 * Story Arc (10 seconds):
 * Act 1 (0-2s):   Two globes fly in from sides (continuity from city input)
 * Act 2 (2-3.5s): Aura Logo materializes at screen center with glow
 * Act 3 (3.5-5s): Energy beams shoot from Logo to both globes
 * Act 4 (5-6.5s): World map emerges, globes transform into city markers
 * Act 5 (6.5-8s): Energy beams merge into breathing Heartline
 * Act 6 (8-10s):  Everything fades to main screen gradient
 */

const ConnectionIntroRedesign: React.FC = () => {
  const { myLocation, partnerLocation } = useLocationStore();

  // Master timeline
  const masterProgress = useSharedValue(0);

  // Generate stars
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT * 0.6, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  // Globe positions (more spread out for dramatic effect)
  const leftGlobeX = SCREEN_WIDTH * 0.15;
  const leftGlobeY = SCREEN_HEIGHT * 0.40;
  const rightGlobeX = SCREEN_WIDTH * 0.85;
  const rightGlobeY = SCREEN_HEIGHT * 0.60;

  // Logo position (center)
  const logoX = SCREEN_WIDTH / 2;
  const logoY = SCREEN_HEIGHT / 2;

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
    masterProgress.value = withTiming(1, {
      duration: ANIMATION_DURATIONS.CONNECTION_INTRO,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    return () => {
      cancelAnimation(masterProgress);
    };
  }, []);

  // Act 1: Globes fly in (0-0.2)
  const leftGlobeStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const appearProgress = interpolate(progress, [0, 0.2], [0, 1], 'clamp');

    // Fade out when map appears
    const fadeOut = interpolate(progress, [0.5, 0.65], [1, 0], 'clamp');

    const opacity = appearProgress * fadeOut;
    const translateX = interpolate(appearProgress, [0, 1], [-100, 0], 'clamp');
    const scale = interpolate(appearProgress, [0, 0.6, 1], [0.5, 1.1, 1], 'clamp');

    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  const rightGlobeStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const appearProgress = interpolate(progress, [0.05, 0.25], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.5, 0.65], [1, 0], 'clamp');

    const opacity = appearProgress * fadeOut;
    const translateX = interpolate(appearProgress, [0, 1], [100, 0], 'clamp');
    const scale = interpolate(appearProgress, [0, 0.6, 1], [0.5, 1.1, 1], 'clamp');

    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  // Act 2: Aura Logo appears (0.2-0.35)
  const logoStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const logoProgress = interpolate(progress, [0.2, 0.35], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    const opacity = logoProgress * fadeOut;
    const scale = interpolate(logoProgress, [0, 0.7, 1], [0.3, 1.15, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Logo glow (breathing after appearance)
  const logoGlowScale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      logoGlowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }, 3500);

    return () => {
      clearTimeout(timer);
      cancelAnimation(logoGlowScale);
    };
  }, []);

  const logoGlowStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const glowProgress = interpolate(progress, [0.2, 0.35], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.8, 1], [1, 0], 'clamp');

    return {
      opacity: glowProgress * fadeOut * 0.6,
      transform: [{ scale: logoGlowScale.value }],
    };
  });

  // Act 3: Energy beams from Logo to globes (0.35-0.5)
  const energyBeamProgress = useSharedValue(0);

  useEffect(() => {
    energyBeamProgress.value = withDelay(
      3500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      })
    );

    return () => {
      cancelAnimation(energyBeamProgress);
    };
  }, []);

  const energyBeamStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const beamProgress = interpolate(progress, [0.35, 0.5], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.65, 0.8], [1, 0], 'clamp');

    return {
      opacity: beamProgress * fadeOut,
    };
  });

  // Energy beam paths
  const leftBeamPath = `M ${logoX} ${logoY} L ${leftGlobeX} ${leftGlobeY}`;
  const rightBeamPath = `M ${logoX} ${logoY} L ${rightGlobeX} ${rightGlobeY}`;
  const beamLength = Math.sqrt(
    Math.pow(leftGlobeX - logoX, 2) + Math.pow(leftGlobeY - logoY, 2)
  );

  const energyBeamPathProps = useAnimatedProps(() => {
    const progress = energyBeamProgress.value;
    return {
      strokeDashoffset: beamLength * (1 - progress),
    };
  });

  // Act 4: World map emerges, globes transform (0.5-0.65)
  const worldMapStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const mapProgress = interpolate(progress, [0.5, 0.65], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.95, 1], [1, 0], 'clamp');

    const opacity = mapProgress * 0.5 * fadeOut;
    const scale = interpolate(mapProgress, [0, 0.7, 1], [0.8, 1.05, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const cityMarkersProps = useAnimatedProps(() => {
    const progress = masterProgress.value;
    const markerProgress = interpolate(progress, [0.55, 0.7], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.95, 1], [1, 0], 'clamp');

    return {
      opacity: markerProgress * fadeOut,
    };
  });

  // Act 5: Heartline forms (0.65-0.8)
  const heartlineProgress = useSharedValue(0);

  useEffect(() => {
    heartlineProgress.value = withDelay(
      6500,
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      })
    );

    return () => {
      cancelAnimation(heartlineProgress);
    };
  }, []);

  const heartlineStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const lineProgress = interpolate(progress, [0.65, 0.8], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.95, 1], [1, 0], 'clamp');

    return {
      opacity: lineProgress * fadeOut,
    };
  });

  // Heartline path (curved)
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

  // Heartline breathing
  const heartlinePulse = useSharedValue(0.5);

  useEffect(() => {
    const timer = setTimeout(() => {
      heartlinePulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.bezier(0.45, 0.05, 0.55, 0.95) }),
          withTiming(0.5, { duration: 2000, easing: Easing.bezier(0.45, 0.05, 0.55, 0.95) })
        ),
        -1,
        false
      );
    }, 7500);

    return () => {
      clearTimeout(timer);
      cancelAnimation(heartlinePulse);
    };
  }, []);

  const heartlinePulseProps = useAnimatedProps(() => {
    const opacity = interpolate(
      heartlinePulse.value,
      [0.5, 0.75, 1],
      [0.5, 0.9, 0.7],
      'clamp'
    );

    return {
      strokeOpacity: opacity,
    };
  });

  // Act 6: Final transition (0.8-1)
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
    const textProgress = interpolate(progress, [0.35, 0.55], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.95, 1], [1, 0], 'clamp');

    const opacity = textProgress * fadeOut;
    const translateY = interpolate(textProgress, [0, 1], [20, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const subtitleStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    const textProgress = interpolate(progress, [0.55, 0.75], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.95, 1], [1, 0], 'clamp');

    const opacity = textProgress * fadeOut;
    const translateY = interpolate(textProgress, [0, 1], [20, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Stars fade
  const starsStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    return {
      opacity: interpolate(progress, [0, 0.3, 0.95], [0.6, 0.2, 0], 'clamp'),
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
                opacity: star.opacity * 0.7,
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
          strokeColor="rgba(255, 255, 255, 0.25)"
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
              opacity={0.9}
            />
            <Circle
              cx={myMapPos.x}
              cy={myMapPos.y}
              r={8}
              fill="none"
              stroke={MARKER_CONFIG.MY_COLOR}
              strokeWidth={2}
              opacity={0.5}
            />

            {/* Partner city */}
            <Circle
              cx={partnerMapPos.x}
              cy={partnerMapPos.y}
              r={4}
              fill={MARKER_CONFIG.PARTNER_COLOR}
              opacity={0.9}
            />
            <Circle
              cx={partnerMapPos.x}
              cy={partnerMapPos.y}
              r={8}
              fill="none"
              stroke={MARKER_CONFIG.PARTNER_COLOR}
              strokeWidth={2}
              opacity={0.5}
            />
          </AnimatedG>
        </Svg>
      </Animated.View>

      {/* Two globes */}
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
          <Circle cx="40" cy="40" r="35" fill="url(#leftGlow)" opacity={0.4} />
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
          <Circle cx="40" cy="40" r="35" fill="url(#rightGlow)" opacity={0.4} />
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

      {/* Aura Logo - the unifying element */}
      <Animated.View
        style={[
          styles.logoContainer,
          logoStyle,
        ]}
      >
        {/* Logo glow rings */}
        <Animated.View style={[styles.logoGlowOuter, logoGlowStyle]} />
        <Animated.View style={[styles.logoGlowInner, logoGlowStyle]} />

        {/* Logo itself */}
        <AuraLogo size={100} />
      </Animated.View>

      {/* Energy beams from Logo to globes */}
      <Animated.View style={[StyleSheet.absoluteFill, energyBeamStyle]} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          {/* Left beam */}
          <AnimatedPath
            d={leftBeamPath}
            stroke="rgba(6, 182, 212, 0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={beamLength}
            animatedProps={energyBeamPathProps}
          />
          <AnimatedPath
            d={leftBeamPath}
            stroke="rgba(6, 182, 212, 0.3)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={beamLength}
            animatedProps={energyBeamPathProps}
            opacity={0.5}
          />

          {/* Right beam */}
          <AnimatedPath
            d={rightBeamPath}
            stroke="rgba(236, 72, 153, 0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={beamLength}
            animatedProps={energyBeamPathProps}
          />
          <AnimatedPath
            d={rightBeamPath}
            stroke="rgba(236, 72, 153, 0.3)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={beamLength}
            animatedProps={energyBeamPathProps}
            opacity={0.5}
          />
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
            stroke="rgba(167, 139, 250, 0.3)"
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

      {/* Final transition gradient */}
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
  logoContainer: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 50,
    top: SCREEN_HEIGHT / 2 - 50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  logoGlowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.12,
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
    textShadowColor: 'rgba(167, 139, 250, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1.5,
  },
});

export default ConnectionIntroRedesign;
