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
import { BlurView } from 'expo-blur';

interface CloudEffectProps {
  density: 'partly' | 'overcast'; // Based on weather code 2-3
  isDay: boolean;
}

interface Cloud {
  id: number;
  startY: number; // Vertical position percentage
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const CloudEffect: React.FC<CloudEffectProps> = ({ density, isDay }) => {
  // Adjust cloud count based on density
  const cloudCounts = {
    partly: 3,
    overcast: 6,
  };

  const cloudCount = cloudCounts[density];

  // Generate clouds with randomized properties
  const clouds: Cloud[] = Array.from({ length: cloudCount }, (_, i) => ({
    id: i,
    startY: 10 + Math.random() * 40, // 10-50% from top
    delay: Math.random() * 5000, // 0-5s delay
    duration: 40000 + Math.random() * 20000, // 40-60s drift duration (very slow)
    size: 80 + Math.random() * 60, // 80-140px width
    opacity: density === 'overcast' ? 0.25 : 0.15,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          startY={cloud.startY}
          delay={cloud.delay}
          duration={cloud.duration}
          size={cloud.size}
          opacity={cloud.opacity}
          isDay={isDay}
        />
      ))}
    </View>
  );
};

interface CloudProps {
  startY: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  isDay: boolean;
}

const Cloud: React.FC<CloudProps> = ({ startY, delay, duration, size, opacity, isDay }) => {
  const translateX = useSharedValue(-20); // Start from left off-screen
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Horizontal drift across screen
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(120, {
          // End off-screen right
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // Gentle scaling for depth effect
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.1, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  // Cloud color based on day/night
  const cloudColor = isDay
    ? 'rgba(255, 255, 255, 0.6)' // White clouds for day
    : 'rgba(148, 163, 184, 0.3)'; // Gray-blue clouds for night

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top: `${startY}%`,
          width: size,
          height: size * 0.6, // Clouds are wider than tall
        },
        animatedStyle,
      ]}
    >
      {/* Use BlurView for soft, cloud-like appearance */}
      <BlurView intensity={20} tint={isDay ? 'light' : 'dark'} style={styles.blurContainer}>
        <View
          style={[
            styles.cloudShape,
            {
              backgroundColor: cloudColor,
              opacity,
            },
          ]}
        />
      </BlurView>
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
  blurContainer: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  cloudShape: {
    flex: 1,
    borderRadius: 100,
  },
});

export default CloudEffect;
