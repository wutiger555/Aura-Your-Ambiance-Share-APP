import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Globe, Clock, ArrowUpDown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { WeatherData } from '@aura/shared';
import { getDSTInfo } from '../../utils/dstUtils';
import HeartlineParticles from './HeartlineParticles';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartlineRedesignProps {
  distance: number | null;
  timeDifference: number | null;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  onShowDetails: () => void;
  onSwapPositions: () => void; // v2.6.0: New swap handler
  showInfo: boolean; // v2.6.0: Control visibility of distance/time info
}

/**
 * HeartlineRedesign - Living connection curve with elegant swap button
 * v2.6.0: Redesigned for minimalist aesthetic
 *
 * Design improvements:
 * - Elegant circular swap button at curve center (glass morphism)
 * - Distance/time info controlled by DisplaySettings (hidden in Minimal mode)
 * - Smooth swap animation (180° rotation + position exchange)
 * - Breathing pulse synchronized across all elements
 */
const HeartlineRedesign: React.FC<HeartlineRedesignProps> = ({
  distance,
  timeDifference,
  myWeather,
  partnerWeather,
  onShowDetails,
  onSwapPositions,
  showInfo,
}) => {
  // Breathing pulse animation (4s cycle)
  const pulseOpacity = useSharedValue(0.3);
  const pulseWidth = useSharedValue(1);

  // Swap button pulse (synchronized with Heartline)
  const buttonPulse = useSharedValue(1);
  const buttonRotation = useSharedValue(0);

  useEffect(() => {
    // Breathing cycle: 4 seconds (2s inhale, 2s exhale)
    pulseOpacity.value = withRepeat(
      withTiming(0.7, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    pulseWidth.value = withRepeat(
      withTiming(2, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Button breathing pulse
    buttonPulse.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  // Animated props for the path
  const animatedPathProps = useAnimatedProps(() => ({
    strokeOpacity: pulseOpacity.value,
    strokeWidth: pulseWidth.value,
  }));

  // Swap button animation
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonPulse.value },
      { rotate: `${buttonRotation.value}deg` },
    ],
  }));

  const handleSwap = () => {
    // 180° rotation animation
    buttonRotation.value = withSequence(
      withTiming(buttonRotation.value + 180, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Trigger parent swap handler
    onSwapPositions();
  };

  const dstStatus = useMemo(() => {
    if (!myWeather || !partnerWeather || timeDifference === null) return null;

    const myDst = getDSTInfo(myWeather.timezone);
    const partnerDst = getDSTInfo(partnerWeather.timezone);

    let transitionInfo = null;
    let locationName = '';
    let futureDiff = 0;

    if (myDst.transitionInfo) {
      transitionInfo = myDst.transitionInfo;
      locationName = 'Your location';
      const futureMyOffset = transitionInfo.futureOffset / 60;
      const partnerOffset = partnerWeather.utc_offset_seconds / 3600;
      futureDiff = Math.abs(futureMyOffset - partnerOffset);
    } else if (partnerDst.transitionInfo) {
      transitionInfo = partnerDst.transitionInfo;
      locationName = `Partner's location`;
      const myOffset = myWeather.utc_offset_seconds / 3600;
      const futurePartnerOffset = transitionInfo.futureOffset / 60;
      futureDiff = Math.abs(myOffset - futurePartnerOffset);
    }

    // If a transition is coming and it changes the time difference, return a detailed warning.
    if (transitionInfo && Math.abs(timeDifference - futureDiff) > 0) {
      return {
        text: `Heads up: ${locationName} is set ${transitionInfo.warningMessage}. The new difference will be ${futureDiff}h.`,
        isWarning: true,
      };
    }

    // Otherwise, return the standard timezone abbreviations.
    return {
      text: `${myDst.timezoneAbbr} / ${partnerDst.timezoneAbbr}`,
      isWarning: false,
    };
  }, [myWeather, partnerWeather, timeDifference]);

  // Get colors from weather data for particles
  const myColor = myWeather?.current.is_day === 1
    ? 'rgba(6, 182, 212, 0.9)' // Cyan for day
    : 'rgba(147, 51, 234, 0.9)'; // Purple for night

  const partnerColor = partnerWeather?.current.is_day === 1
    ? 'rgba(251, 146, 60, 0.9)' // Orange for day
    : 'rgba(236, 72, 153, 0.9)'; // Pink for night

  // Dynamic particle count based on distance
  const particleCount = useMemo(() => {
    if (!distance) return 6;
    if (distance < 1000) return 4; // Very close
    if (distance < 5000) return 6; // Moderate distance
    if (distance < 10000) return 8; // Far
    return 10; // Very far
  }, [distance]);

  // Curve control points for energy effects
  const curvePoints = {
    startX: SCREEN_WIDTH / 2,
    startY: SCREEN_HEIGHT * 0.85,
    controlX: SCREEN_WIDTH * 0.8,
    controlY: SCREEN_HEIGHT / 2,
    endX: SCREEN_WIDTH / 2,
    endY: SCREEN_HEIGHT * 0.15,
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Flowing particles along the curve */}
      {myWeather && partnerWeather && (
        <HeartlineParticles
          particleCount={particleCount}
          myColor={myColor}
          partnerColor={partnerColor}
        />
      )}

      {/* SVG connection curve with breathing animation */}
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
        style={styles.svg}
        pointerEvents="none"
      >
        {/* Solid glowing base path */}
        <AnimatedPath
          d={`M ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.85} Q ${SCREEN_WIDTH * 0.8},${SCREEN_HEIGHT / 2} ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.15}`}
          stroke="rgba(255, 255, 255, 0.6)"
          fill="none"
          animatedProps={animatedPathProps}
        />

        {/* Outer glow effect */}
        <AnimatedPath
          d={`M ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.85} Q ${SCREEN_WIDTH * 0.8},${SCREEN_HEIGHT / 2} ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.15}`}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
          fill="none"
          opacity={0.3}
        />
      </Svg>

      {/* Center content - simplified for better centering */}
      <View style={styles.centerContent}>
        <View style={styles.centerRow}>
          {/* Elegant swap button */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwap}
              activeOpacity={0.85}
            >
              <BlurView intensity={70} tint="dark" style={styles.swapButtonBlur}>
                <View style={styles.swapButtonInner}>
                  <ArrowUpDown size={20} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.5} />
                </View>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Distance/Time info - moved next to swap button for better balance */}
          {showInfo && distance !== null && timeDifference !== null && (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={onShowDetails}
              activeOpacity={0.8}
            >
              <BlurView intensity={50} tint="dark" style={styles.infoButtonBlur}>
                <View style={styles.infoContent}>
                  <View style={styles.stat}>
                    <Globe size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.statText}>
                      {Math.round(distance).toLocaleString()} km
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.stat}>
                    <Clock size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.statText}>
                      {timeDifference >= 0 ? '+' : ''}
                      {timeDifference}h
                    </Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* DST warning/info - kept below but less intrusive */}
        {dstStatus && (
          <Text style={[styles.dstText, dstStatus.isWarning && styles.dstWarning]}>
            {dstStatus.text}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    alignItems: 'center',
    gap: 8,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Elegant swap button
  swapButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  swapButtonBlur: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  swapButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  // Info button (distance/time)
  infoButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  infoButtonBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dstText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dstWarning: {
    color: '#facc15', // Yellow for warning
  },
});

export default HeartlineRedesign;
