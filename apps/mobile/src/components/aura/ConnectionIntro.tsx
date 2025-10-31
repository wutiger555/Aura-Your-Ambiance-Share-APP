import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
import {
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  MARKER_CONFIG,
  STARRY_CONFIG,
} from '../../constants/Animations';
import { generateStars } from '../../utils/animationUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ConnectionIntro - Animated intro screen with starry background and connection animation
 * Recreates the web version's intro experience
 */
const ConnectionIntro: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Animation values
  const markerMyScale = useSharedValue(0);
  const markerMyOpacity = useSharedValue(0);
  const markerPartnerScale = useSharedValue(0);
  const markerPartnerOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  // Generate stars once
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  useEffect(() => {
    // Start connecting animation after brief delay
    const connectTimer = setTimeout(() => {
      setIsConnecting(true);
    }, 100);

    // Animate "my" marker
    markerMyOpacity.value = withDelay(
      300,
      withTiming(1, {
        duration: ANIMATION_DURATIONS.MARKER_APPEAR,
        easing: Easing.out(Easing.ease),
      })
    );
    markerMyScale.value = withDelay(
      300,
      withSequence(
        withTiming(MARKER_CONFIG.PULSE_SCALE, {
          duration: ANIMATION_DURATIONS.MARKER_APPEAR,
          easing: Easing.out(Easing.back(2)),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        })
      )
    );

    // Animate "partner" marker (staggered)
    markerPartnerOpacity.value = withDelay(
      300 + ANIMATION_DELAYS.MARKER_STAGGER,
      withTiming(1, {
        duration: ANIMATION_DURATIONS.MARKER_APPEAR,
        easing: Easing.out(Easing.ease),
      })
    );
    markerPartnerScale.value = withDelay(
      300 + ANIMATION_DELAYS.MARKER_STAGGER,
      withSequence(
        withTiming(MARKER_CONFIG.PULSE_SCALE, {
          duration: ANIMATION_DURATIONS.MARKER_APPEAR,
          easing: Easing.out(Easing.back(2)),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        })
      )
    );

    // Connection flash animation
    flashOpacity.value = withDelay(
      ANIMATION_DELAYS.CONNECTION_FLASH,
      withSequence(
        withTiming(1, {
          duration: ANIMATION_DURATIONS.CONNECTION_FLASH / 2,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: ANIMATION_DURATIONS.CONNECTION_FLASH / 2,
          easing: Easing.in(Easing.ease),
        })
      )
    );
    flashScale.value = withDelay(
      ANIMATION_DELAYS.CONNECTION_FLASH,
      withSequence(
        withTiming(1.2, {
          duration: ANIMATION_DURATIONS.CONNECTION_FLASH / 2,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(2, {
          duration: ANIMATION_DURATIONS.CONNECTION_FLASH / 2,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    // Text fade in
    textOpacity.value = withDelay(
      ANIMATION_DELAYS.INTRO_TEXT,
      withTiming(1, {
        duration: ANIMATION_DURATIONS.FADE_IN,
        easing: Easing.out(Easing.ease),
      })
    );

    return () => clearTimeout(connectTimer);
  }, []);

  // Animated styles
  const markerMyStyle = useAnimatedStyle(() => ({
    opacity: markerMyOpacity.value,
    transform: [{ scale: markerMyScale.value }],
  }));

  const markerPartnerStyle = useAnimatedStyle(() => ({
    opacity: markerPartnerOpacity.value,
    transform: [{ scale: markerPartnerScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Starry background gradient */}
      <LinearGradient
        colors={
          isConnecting
            ? [STARRY_CONFIG.CONNECTED_COLOR, '#1e1b4b', STARRY_CONFIG.BASE_COLOR]
            : [STARRY_CONFIG.BASE_COLOR, '#334155']
        }
        style={styles.background}
      >
        {/* Stars */}
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
                opacity: star.opacity,
              },
            ]}
          />
        ))}

        {/* Logo in center */}
        <View style={styles.logoContainer}>
          <AuraLogo size={120} animate={true} />
        </View>

        {/* Marker for "my" location */}
        <Animated.View style={[styles.markerMy, markerMyStyle]}>
          <View style={[styles.markerDot, { backgroundColor: MARKER_CONFIG.MY_COLOR }]} />
          <View
            style={[
              styles.markerPulse,
              { backgroundColor: MARKER_CONFIG.MY_COLOR, opacity: 0.3 },
            ]}
          />
        </Animated.View>

        {/* Marker for "partner" location */}
        <Animated.View style={[styles.markerPartner, markerPartnerStyle]}>
          <View
            style={[styles.markerDot, { backgroundColor: MARKER_CONFIG.PARTNER_COLOR }]}
          />
          <View
            style={[
              styles.markerPulse,
              { backgroundColor: MARKER_CONFIG.PARTNER_COLOR, opacity: 0.3 },
            ]}
          />
        </Animated.View>

        {/* Connection flash */}
        <Animated.View style={[styles.flash, flashStyle]} />

        {/* Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>Aura</Text>
          <Text style={styles.subtitle}>Reconnecting worlds...</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
  },
  logoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    zIndex: 20,
  },
  markerMy: {
    position: 'absolute',
    left: '30%',
    top: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerPartner: {
    position: 'absolute',
    right: '30%',
    top: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: MARKER_CONFIG.SIZE,
    height: MARKER_CONFIG.SIZE,
    borderRadius: MARKER_CONFIG.SIZE / 2,
    position: 'absolute',
  },
  markerPulse: {
    width: MARKER_CONFIG.SIZE * 2,
    height: MARKER_CONFIG.SIZE * 2,
    borderRadius: MARKER_CONFIG.SIZE,
  },
  flash: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 15,
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    alignItems: 'center',
    zIndex: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1', // slate-300
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

export default ConnectionIntro;
