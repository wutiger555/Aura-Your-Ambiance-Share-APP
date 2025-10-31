import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ANIMATION_DURATIONS } from '../../constants/Animations';

interface AuraLogoProps {
  size?: number;
  animate?: boolean;
}

/**
 * AuraLogo - Animated SVG logo
 * Simplified version to avoid SVG component registration conflicts
 */
const AuraLogo: React.FC<AuraLogoProps> = ({ size = 120, animate = true }) => {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    if (animate) {
      // Fade in and scale up
      logoOpacity.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.FADE_IN,
        easing: Easing.out(Easing.ease),
      });

      logoScale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.DRAW_RING,
        easing: Easing.out(Easing.back(1.5)),
      });
    } else {
      // If not animating, show immediately
      logoOpacity.value = 1;
      logoScale.value = 1;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const radius = size / 2;
  const strokeWidth = 2;
  const innerRadius = radius * 0.6;

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={strokeWidth}
        />

        {/* Inner glow circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="rgba(255, 255, 255, 0.2)"
        />

        {/* Center dot */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius * 0.3}
          fill="rgba(255, 255, 255, 0.9)"
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuraLogo;
