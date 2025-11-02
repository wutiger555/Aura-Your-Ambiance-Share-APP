import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ThunderstormEffectProps {
  isDay: boolean;
}

const ThunderstormEffect: React.FC<ThunderstormEffectProps> = ({ isDay }) => {
  const [lightningKey, setLightningKey] = useState(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Trigger lightning at random intervals (5-15 seconds)
    const triggerLightning = () => {
      const delay = 5000 + Math.random() * 10000;

      setTimeout(() => {
        // Flash sequence: quick bright flash, brief dark, quick flash again, then fade
        opacity.value = withSequence(
          withTiming(0.3, { duration: 50 }), // Initial flash
          withTiming(0, { duration: 100 }), // Brief dark
          withTiming(0.4, { duration: 50 }), // Second flash (brighter)
          withTiming(0, { duration: 200 }), // Fade out
          withTiming(0, { duration: 0 }, () => {
            runOnJS(triggerLightning)(); // Schedule next lightning
          })
        );

        // Update key to re-render lightning bolt position
        setLightningKey((prev) => prev + 1);
      }, delay);
    };

    triggerLightning();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Lightning color (white with slight blue tint)
  const lightningColor = 'rgba(224, 242, 254, 0.9)';

  // Random position for lightning bolt
  const boltPosition = Math.random() * 80 + 10; // 10-90% from left

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, animatedStyle]} />

      {/* Lightning bolt */}
      <Animated.View
        key={lightningKey}
        style={[
          styles.lightningBolt,
          {
            left: `${boltPosition}%`,
            backgroundColor: lightningColor,
          },
          animatedStyle,
        ]}
      >
        {/* Jagged lightning effect using multiple offset views */}
        <View style={[styles.boltSegment, { left: -2, top: '20%' }]} />
        <View style={[styles.boltSegment, { left: 4, top: '40%' }]} />
        <View style={[styles.boltSegment, { left: -3, top: '60%' }]} />
        <View style={[styles.boltSegment, { left: 5, top: '80%' }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  lightningBolt: {
    position: 'absolute',
    top: 0,
    width: 3,
    height: '50%',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  boltSegment: {
    position: 'absolute',
    width: 3,
    height: '20%',
    backgroundColor: 'rgba(224, 242, 254, 0.9)',
  },
});

export default ThunderstormEffect;
