import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { ANIMATION_DURATIONS } from '../../constants/Animations';

interface AuraLogoProps {
  size?: number;
  animate?: boolean;
}

const AuraLogo: React.FC<AuraLogoProps> = ({ size = 120, animate = true }) => {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    if (animate) {
      logoOpacity.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.FADE_IN,
        easing: Easing.out(Easing.ease),
      });

      logoScale.value = withTiming(1, {
        duration: ANIMATION_DURATIONS.DRAW_RING,
        easing: Easing.out(Easing.back(1.5)),
      });
    } else {
      logoOpacity.value = 1;
      logoScale.value = 1;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="auraGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#FDE68A" />
            <Stop offset="30%" stopColor="#FBCFE8" />
            <Stop offset="55%" stopColor="#C7D2FE" />
            <Stop offset="100%" stopColor="#60A5FA" />
          </LinearGradient>
        </Defs>
        <G transform="rotate(-90 50 50)">
          <Circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
          <Circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
        </G>
        <Circle cx="50" cy="50" r="45" fill="url(#auraGradient)" />
        <Circle cx="50" cy="50" r="5" fill="#fefce8" />
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
