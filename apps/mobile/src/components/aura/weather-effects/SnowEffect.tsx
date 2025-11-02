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

interface SnowEffectProps {
  intensity: 'light' | 'moderate' | 'heavy'; // Based on weather code
  isDay: boolean;
}

interface Snowflake {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  size: number;
  drift: number; // Horizontal drift amount
}

const SnowEffect: React.FC<SnowEffectProps> = ({ intensity, isDay }) => {
  // Adjust particle count based on intensity
  const flakeCounts = {
    light: 20,
    moderate: 35,
    heavy: 50,
  };

  const flakeCount = flakeCounts[intensity];

  // Generate snowflakes with randomized properties
  const snowflakes: Snowflake[] = Array.from({ length: flakeCount }, (_, i) => ({
    id: i,
    startX: Math.random() * 100, // Percentage
    delay: Math.random() * 3000, // 0-3s delay
    duration: 3000 + Math.random() * 2000, // 3-5s fall duration (slower than rain)
    size: 3 + Math.random() * 4, // 3-7px
    drift: (Math.random() - 0.5) * 30, // -15 to +15 horizontal drift
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          startX={flake.startX}
          delay={flake.delay}
          duration={flake.duration}
          size={flake.size}
          drift={flake.drift}
          isDay={isDay}
        />
      ))}
    </View>
  );
};

interface SnowflakeProps {
  startX: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  isDay: boolean;
}

const Snowflake: React.FC<SnowflakeProps> = ({ startX, delay, duration, size, drift, isDay }) => {
  const translateY = useSharedValue(-10);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Animate falling
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(120, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      )
    );

    // Horizontal drift (swaying motion)
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(drift, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.sine),
        }),
        -1,
        true // Reverse for swaying
      )
    );

    // Gentle rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration: duration * 1.5,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // Fade in/out
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.8, {
          duration: duration / 3,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, [delay, duration, drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: `${translateY.value}%` },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  // Color based on day/night
  const flakeColor = isDay
    ? 'rgba(255, 255, 255, 0.9)' // Pure white for day
    : 'rgba(226, 232, 240, 0.85)'; // Slightly blue-ish white for night

  return (
    <Animated.View
      style={[
        styles.snowflake,
        {
          left: `${startX}%`,
          width: size,
          height: size,
          backgroundColor: flakeColor,
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
  snowflake: {
    position: 'absolute',
    top: 0,
    borderRadius: 100, // Circular snowflakes
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
});

export default SnowEffect;
