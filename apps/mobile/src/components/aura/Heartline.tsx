import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Globe, Clock } from 'lucide-react-native';
import { WeatherData } from '@aura/shared';
import { getDSTInfo } from '../../utils/dstUtils';
import HeartlineParticles from './HeartlineParticles';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartlineProps {
  distance: number | null;
  timeDifference: number | null;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  onShowDetails: () => void;
}

/**
 * Heartline - Living connection curve with breathing pulse and flowing particles
 * Represents the continuous emotional connection between two people
 */
const Heartline: React.FC<HeartlineProps> = ({
  distance,
  timeDifference,
  myWeather,
  partnerWeather,
  onShowDetails,
}) => {
  // Breathing pulse animation
  const pulseOpacity = useSharedValue(0.3);
  const pulseWidth = useSharedValue(1);

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
  }, []);

  // Animated props for the path
  const animatedPathProps = useAnimatedProps(() => ({
    strokeOpacity: pulseOpacity.value,
    strokeWidth: pulseWidth.value,
  }));

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
      text: `Timezones: ${myDst.timezoneAbbr} / ${partnerDst.timezoneAbbr}`,
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
  // Closer = fewer particles (strong connection), farther = more particles (more space to bridge)
  const particleCount = useMemo(() => {
    if (!distance) return 6;
    if (distance < 1000) return 4; // Very close
    if (distance < 5000) return 6; // Moderate distance
    if (distance < 10000) return 8; // Far
    return 10; // Very far
  }, [distance]);

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

      {/* Interactive button in center */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          style={styles.button}
          onPress={onShowDetails}
          activeOpacity={0.8}
        >
          {distance !== null && (
            <View style={styles.stat}>
              <Globe size={16} color="white" />
              <Text style={styles.statText}>
                {Math.round(distance).toLocaleString()} km
              </Text>
            </View>
          )}

          {distance !== null && timeDifference !== null && (
            <View style={styles.divider} />
          )}

          {timeDifference !== null && (
            <View style={styles.stat}>
              <Clock size={16} color="white" />
              <Text style={styles.statText}>
                {timeDifference >= 0 ? '+' : ''}
                {timeDifference}h
              </Text>
            </View>
          )}
        </TouchableOpacity>

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
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 10, 20, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dstText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dstWarning: {
    color: '#facc15', // Yellow for warning
  },
});

export default Heartline;
