import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Line, Defs, RadialGradient as SvgRadialGradient, Stop, G } from 'react-native-svg';
import {
  ANIMATION_DURATIONS,
  MARKER_CONFIG,
  STARRY_CONFIG,
} from '../../constants/Animations';
import { generateStars } from '../../utils/animationUtils';
import { useLocationStore } from '../../stores/useLocationStore';
import MinimalistWorldMap from './MinimalistWorldMap';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * ConnectionIntro v3 - "Stars to World" Narrative
 *
 * Conceptual Journey:
 * 1. Two stars in darkness (representing two cities)
 * 2. Stars travel toward each other, leaving light trails
 * 3. Stars merge into brilliant burst
 * 4. World map emerges from the burst
 * 5. Cities are marked on the map with connecting line
 * 6. Camera "flies into" the map (zoom effect) → transition to main app
 *
 * Timeline (8s total):
 * 0-1s:     Stars appear in deep night
 * 1-3s:     Stars travel toward center with trails
 * 3-3.5s:   Stars merge → brilliant burst
 * 3.5-5s:   World map fades in, cities marked
 * 5-6s:     Connection line draws between cities
 * 6-8s:     Zoom into map (fly-in effect) → transition
 */
const ConnectionIntro: React.FC = () => {
  // Get locations from store
  const { myLocation, partnerLocation } = useLocationStore();

  // Master progress: 0 = start, 1 = complete
  const masterProgress = useSharedValue(0);

  // Generate starfield
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  // Calculate star positions and paths
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT * 0.5;

  const myStartX = SCREEN_WIDTH * 0.2;
  const myStartY = SCREEN_HEIGHT * 0.35;

  const partnerStartX = SCREEN_WIDTH * 0.8;
  const partnerStartY = SCREEN_HEIGHT * 0.65;

  // Curved paths for light trails
  const myPathData = `M ${myStartX},${myStartY} Q ${myStartX + 80},${myStartY + 40} ${centerX},${centerY}`;
  const partnerPathData = `M ${partnerStartX},${partnerStartY} Q ${partnerStartX - 80},${partnerStartY - 40} ${centerX},${centerY}`;

  // Calculate path lengths
  const myPathLength = Math.sqrt(
    Math.pow(centerX - myStartX, 2) + Math.pow(centerY - myStartY, 2)
  );
  const partnerPathLength = Math.sqrt(
    Math.pow(centerX - partnerStartX, 2) + Math.pow(centerY - partnerStartY, 2)
  );

  // Convert lat/long to map coordinates (simplified projection)
  const latLongToMapCoords = (lat: number, lon: number) => {
    // Map viewport is 360x180, centered at (180, 90)
    // Longitude: -180 to 180 → 0 to 360
    // Latitude: 90 to -90 → 0 to 180
    const x = ((lon + 180) / 360) * 360;
    const y = ((90 - lat) / 180) * 180;
    return { x, y };
  };

  // Get city coordinates on map
  const myMapPos = myLocation
    ? latLongToMapCoords(myLocation.latitude, myLocation.longitude)
    : { x: 100, y: 60 }; // fallback

  const partnerMapPos = partnerLocation
    ? latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude)
    : { x: 260, y: 120 }; // fallback

  useEffect(() => {
    // Master timeline animation (8s total)
    masterProgress.value = withTiming(1, {
      duration: 8000,
      easing: Easing.inOut(Easing.cubic),
    });
  }, []);

  // Background: deep night throughout (no pink transition)
  const backgroundOverlayStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    // Subtle brightness increase only
    const overlayOpacity = interpolate(progress, [0, 0.6, 1], [0, 0.1, 0.2], 'clamp');

    return {
      opacity: overlayOpacity,
      backgroundColor: '#1e1b4b', // Subtle indigo glow
    };
  });

  // My star animation (0.1-0.375)
  const myStarAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    // Move: 0.1-0.375 (2.2s duration in 8s timeline)
    const moveProgress = interpolate(progress, [0.1, 0.375], [0, 1], 'clamp');

    const x = interpolate(moveProgress, [0, 1], [myStartX, centerX]);
    const y = interpolate(moveProgress, [0, 1], [myStartY, centerY]);

    // Fade in: 0-0.1, Fade out at merge: 0.36-0.375
    const opacity = interpolate(
      progress,
      [0, 0.1, 0.36, 0.375],
      [0, 1, 1, 0],
      'clamp'
    );

    const scale = interpolate(moveProgress, [0, 1], [1, 1.5], 'clamp');

    return {
      position: 'absolute',
      left: x - 20,
      top: y - 20,
      opacity,
      transform: [{ scale }],
    };
  });

  // Partner star animation
  const partnerStarAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    const moveProgress = interpolate(progress, [0.125, 0.375], [0, 1], 'clamp');

    const x = interpolate(moveProgress, [0, 1], [partnerStartX, centerX]);
    const y = interpolate(moveProgress, [0, 1], [partnerStartY, centerY]);

    const opacity = interpolate(
      progress,
      [0, 0.125, 0.36, 0.375],
      [0, 1, 1, 0],
      'clamp'
    );

    const scale = interpolate(moveProgress, [0, 1], [1, 1.5], 'clamp');

    return {
      position: 'absolute',
      left: x - 20,
      top: y - 20,
      opacity,
      transform: [{ scale }],
    };
  });

  // Light trail paths
  const myPathAnimatedProps = useAnimatedProps(() => {
    const progress = masterProgress.value;
    const pathProgress = interpolate(progress, [0.1, 0.375], [0, 1], 'clamp');

    return {
      strokeDashoffset: myPathLength * (1 - pathProgress),
      opacity: interpolate(progress, [0.1, 0.375, 0.44], [0, 0.8, 0], 'clamp'),
    };
  });

  const partnerPathAnimatedProps = useAnimatedProps(() => {
    const progress = masterProgress.value;
    const pathProgress = interpolate(progress, [0.125, 0.375], [0, 1], 'clamp');

    return {
      strokeDashoffset: partnerPathLength * (1 - pathProgress),
      opacity: interpolate(progress, [0.125, 0.375, 0.44], [0, 0.8, 0], 'clamp'),
    };
  });

  // Merge burst (0.375-0.5)
  const burstAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    // Burst: 0.375-0.5 (3-4s)
    const burstProgress = interpolate(progress, [0.375, 0.5], [0, 1], 'clamp');

    const scale = interpolate(burstProgress, [0, 1], [0, 10], 'clamp');
    const opacity = interpolate(
      burstProgress,
      [0, 0.3, 1],
      [0, 1, 0],
      'clamp'
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // World map fade in (0.44-0.625)
  const worldMapAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    // Map fades in: 0.44-0.625 (3.5s-5s)
    const mapProgress = interpolate(progress, [0.44, 0.625], [0, 1], 'clamp');

    const opacity = interpolate(mapProgress, [0, 1], [0, 1], 'clamp');
    const scale = interpolate(mapProgress, [0, 1], [0.8, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // City markers on map (0.5-0.65)
  const cityMarkersAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    const markerProgress = interpolate(progress, [0.5, 0.65], [0, 1], 'clamp');

    const opacity = interpolate(markerProgress, [0, 1], [0, 1], 'clamp');
    const scale = interpolate(markerProgress, [0, 0.5, 1], [0, 1.3, 1], 'clamp');

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Connection line between cities (0.625-0.75)
  const connectionLineAnimatedProps = useAnimatedProps(() => {
    const progress = masterProgress.value;

    const lineProgress = interpolate(progress, [0.625, 0.75], [0, 1], 'clamp');

    // Calculate line length
    const dx = partnerMapPos.x - myMapPos.x;
    const dy = partnerMapPos.y - myMapPos.y;
    const lineLength = Math.sqrt(dx * dx + dy * dy);

    return {
      strokeDashoffset: lineLength * (1 - lineProgress),
      opacity: interpolate(progress, [0.625, 0.75], [0, 0.8], 'clamp'),
    };
  });

  // Zoom into map (0.75-1)
  const zoomAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    // Zoom: 0.75-1 (6s-8s)
    const zoomProgress = interpolate(progress, [0.75, 1], [0, 1], 'clamp');

    const scale = interpolate(zoomProgress, [0, 1], [1, 3.5], 'clamp');
    const opacity = interpolate(zoomProgress, [0, 0.7, 1], [1, 0.7, 0], 'clamp');

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Background stars fade out
  const starsOpacity = useAnimatedStyle(() => {
    const progress = masterProgress.value;
    return {
      opacity: interpolate(progress, [0, 0.44, 0.75], [0.6, 0.3, 0], 'clamp'),
    };
  });

  // Text animation (0.6-0.75)
  const textAnimatedStyle = useAnimatedStyle(() => {
    const progress = masterProgress.value;

    const textProgress = interpolate(progress, [0.6, 0.75], [0, 1], 'clamp');
    const fadeOut = interpolate(progress, [0.85, 0.95], [1, 0], 'clamp');

    const opacity = interpolate(textProgress, [0, 1], [0, 1], 'clamp') * fadeOut;
    const translateY = interpolate(textProgress, [0, 1], [20, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Base gradient background - deep night */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#0f172a']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundOverlayStyle]} />

      {/* Starfield (fades out) */}
      <Animated.View style={[StyleSheet.absoluteFill, starsOpacity]}>
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

      {/* SVG Layer for paths */}
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgRadialGradient id="burstGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>

        {/* Light trail paths */}
        <AnimatedPath
          d={myPathData}
          stroke={MARKER_CONFIG.MY_COLOR}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={myPathLength}
          animatedProps={myPathAnimatedProps}
        />

        <AnimatedPath
          d={partnerPathData}
          stroke={MARKER_CONFIG.PARTNER_COLOR}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={partnerPathLength}
          animatedProps={partnerPathAnimatedProps}
        />
      </Svg>

      {/* My star (cyan) */}
      <Animated.View style={myStarAnimatedStyle}>
        <View style={[styles.starMarker, { backgroundColor: MARKER_CONFIG.MY_COLOR }]} />
        <View
          style={[
            styles.starGlow,
            { backgroundColor: MARKER_CONFIG.MY_COLOR, opacity: 0.4 },
          ]}
        />
      </Animated.View>

      {/* Partner star (pink) */}
      <Animated.View style={partnerStarAnimatedStyle}>
        <View style={[styles.starMarker, { backgroundColor: MARKER_CONFIG.PARTNER_COLOR }]} />
        <View
          style={[
            styles.starGlow,
            { backgroundColor: MARKER_CONFIG.PARTNER_COLOR, opacity: 0.4 },
          ]}
        />
      </Animated.View>

      {/* Merge burst */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.burst, burstAnimatedStyle]} />
      </View>

      {/* World Map Scene (fades in after burst, zooms in at end) */}
      <Animated.View style={[styles.centerContainer, zoomAnimatedStyle]}>
        <Animated.View style={[styles.mapContainer, worldMapAnimatedStyle]}>
          {/* World map */}
          <MinimalistWorldMap
            width={SCREEN_WIDTH * 0.9}
            height={(SCREEN_WIDTH * 0.9) / 2}
            strokeColor="rgba(255, 255, 255, 0.4)"
            strokeWidth={1.5}
          />

          {/* SVG overlay for city markers and connection line */}
          <Svg
            width={SCREEN_WIDTH * 0.9}
            height={(SCREEN_WIDTH * 0.9) / 2}
            viewBox="0 0 360 180"
            style={StyleSheet.absoluteFill}
          >
            {/* Connection line between cities */}
            <AnimatedLine
              x1={myMapPos.x}
              y1={myMapPos.y}
              x2={partnerMapPos.x}
              y2={partnerMapPos.y}
              stroke="rgba(96, 165, 250, 0.6)"
              strokeWidth={2}
              strokeDasharray={Math.sqrt(
                Math.pow(partnerMapPos.x - myMapPos.x, 2) +
                Math.pow(partnerMapPos.y - myMapPos.y, 2)
              )}
              animatedProps={connectionLineAnimatedProps}
            />

            {/* My city marker */}
            <AnimatedG animatedProps={{ opacity: cityMarkersAnimatedStyle.opacity }}>
              <Circle
                cx={myMapPos.x}
                cy={myMapPos.y}
                r={6}
                fill={MARKER_CONFIG.MY_COLOR}
                opacity={0.9}
              />
              <Circle
                cx={myMapPos.x}
                cy={myMapPos.y}
                r={10}
                fill="none"
                stroke={MARKER_CONFIG.MY_COLOR}
                strokeWidth={2}
                opacity={0.5}
              />
            </AnimatedG>

            {/* Partner city marker */}
            <AnimatedG animatedProps={{ opacity: cityMarkersAnimatedStyle.opacity }}>
              <Circle
                cx={partnerMapPos.x}
                cy={partnerMapPos.y}
                r={6}
                fill={MARKER_CONFIG.PARTNER_COLOR}
                opacity={0.9}
              />
              <Circle
                cx={partnerMapPos.x}
                cy={partnerMapPos.y}
                r={10}
                fill="none"
                stroke={MARKER_CONFIG.PARTNER_COLOR}
                strokeWidth={2}
                opacity={0.5}
              />
            </AnimatedG>
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>Bridging Your Worlds</Text>
        <Text style={styles.subtitle}>Distance dissolves in shared skies</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
  centerContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  starMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  starGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -20,
    left: -20,
  },
  burst: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  mapContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: (SCREEN_WIDTH * 0.9) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ConnectionIntro;
