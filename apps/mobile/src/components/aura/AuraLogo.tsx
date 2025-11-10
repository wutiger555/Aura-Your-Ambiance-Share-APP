import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface AuraLogoProps {
  size?: number;
}

/**
 * AuraLogo - Pure static SVG component (v2.6.5)
 *
 * MEMORY OPTIMIZATION:
 * - NO shared values
 * - NO animations
 * - NO Reanimated dependencies
 * - Parent components handle all animations
 *
 * This ensures zero memory overhead from animations.
 */
const AuraLogo: React.FC<AuraLogoProps> = ({ size = 120 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuraLogo;
