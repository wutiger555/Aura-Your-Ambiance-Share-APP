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

interface RainEffectProps {
  intensity: 'light' | 'moderate' | 'heavy'; // Based on weather code
  isDay: boolean;
}

interface RainDrop {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  length: number;
}

const RainEffect: React.FC<RainEffectProps> = ({ intensity, isDay }) => {
  // Adjust particle count based on intensity
  const dropCounts = {
    light: 15,
    moderate: 25,
    heavy: 40,
  };

  const dropCount = dropCounts[intensity];

  // Generate rain drops with randomized properties
  const rainDrops: RainDrop[] = Array.from({ length: dropCount }, (_, i) => ({
    id: i,
    startX: Math.random() * 100, // Percentage
    delay: Math.random() * 2000, // 0-2s delay
    duration: 800 + Math.random() * 400, // 800-1200ms fall duration
    length: intensity === 'heavy' ? 30 : intensity === 'moderate' ? 20 : 15,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {rainDrops.map((drop) => (
        <RainDrop
          key={drop.id}
          startX={drop.startX}
          delay={drop.delay}
          duration={drop.duration}
          length={drop.length}
          isDay={isDay}
        />
      ))}
    </View>
  );
};

interface RainDropProps {
  startX: number;
  delay: number;
  duration: number;
  length: number;
  isDay: boolean;
}

const RainDrop: React.FC<RainDropProps> = ({ startX, delay, duration, length, isDay }) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate falling
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(150, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false
      )
    );

    // Fade in/out for smooth appearance
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.6, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true // Reverse on repeat for fade out
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 0 },
      { translateY: `${translateY.value}%` },
    ],
    opacity: opacity.value,
  }));

  // Color based on day/night
  const dropColor = isDay
    ? 'rgba(173, 216, 230, 0.6)' // Light blue for day
    : 'rgba(147, 197, 253, 0.5)'; // Slightly lighter blue for night

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        {
          left: `${startX}%`,
          height: length,
          backgroundColor: dropColor,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  rainDrop: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    borderRadius: 1,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default RainEffect;
