import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse, G } from 'react-native-svg';

interface CloudEffectProps {
  density: 'partly' | 'overcast'; // Based on weather code 2-3
  isDay: boolean;
}

interface Cloud {
  id: number;
  startY: number; // Vertical position percentage
  delay: number;
  duration: number;
  scale: number;
  opacity: number;
}

/**
 * CloudEffect - Realistic cloud layer with natural shapes
 * v2.7.0: Redesigned for more realistic appearance
 *
 * Improvements:
 * - Natural cloud shapes using overlapping ellipses
 * - More realistic color based on day/night/weather
 * - Subtle parallax effect with multiple layers
 */
const CloudEffect: React.FC<CloudEffectProps> = ({ density, isDay }) => {
  // Adjust cloud count based on density
  const cloudCounts = {
    partly: 4,
    overcast: 8,
  };

  const cloudCount = cloudCounts[density];

  // Generate clouds with randomized properties
  const clouds: Cloud[] = Array.from({ length: cloudCount }, (_, i) => ({
    id: i,
    startY: 5 + Math.random() * 50, // 5-55% from top
    delay: Math.random() * 8000, // 0-8s delay
    duration: 50000 + Math.random() * 30000, // 50-80s drift duration (slow)
    scale: 0.6 + Math.random() * 0.6, // 0.6-1.2 scale
    opacity: density === 'overcast' ? (0.35 + Math.random() * 0.15) : (0.2 + Math.random() * 0.1),
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map((cloud) => (
        <RealisticCloud
          key={cloud.id}
          startY={cloud.startY}
          delay={cloud.delay}
          duration={cloud.duration}
          scale={cloud.scale}
          opacity={cloud.opacity}
          isDay={isDay}
        />
      ))}
    </View>
  );
};

interface RealisticCloudProps {
  startY: number;
  delay: number;
  duration: number;
  scale: number;
  opacity: number;
  isDay: boolean;
}

const RealisticCloud: React.FC<RealisticCloudProps> = ({ startY, delay, duration, scale, opacity, isDay }) => {
  const translateX = useSharedValue(-30); // Start from left off-screen

  useEffect(() => {
    // Horizontal drift across screen
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(130, {
          // End off-screen right
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: `${translateX.value}%` },
    ],
  }));

  // Realistic cloud color based on conditions
  const cloudColor = isDay
    ? 'rgba(255, 255, 255, 0.85)' // Bright white for day
    : 'rgba(200, 210, 220, 0.4)'; // Muted gray-blue for night

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top: `${startY}%`,
        },
        animatedStyle,
      ]}
    >
      <Svg width={220 * scale} height={80 * scale} viewBox="0 0 220 80" style={{ opacity }}>
        <G>
          {/* Natural cloud shape using multiple overlapping ellipses */}
          {/* Bottom base */}
          <Ellipse cx="110" cy="55" rx="90" ry="25" fill={cloudColor} />
          {/* Left puff */}
          <Ellipse cx="60" cy="45" rx="50" ry="35" fill={cloudColor} />
          {/* Center puff (largest) */}
          <Ellipse cx="110" cy="35" rx="65" ry="35" fill={cloudColor} />
          {/* Right puff */}
          <Ellipse cx="160" cy="45" rx="55" ry="30" fill={cloudColor} />
          {/* Top highlight */}
          <Ellipse cx="95" cy="25" rx="45" ry="25" fill={cloudColor} opacity="0.8" />
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    left: 0,
  },
});

export default CloudEffect;
