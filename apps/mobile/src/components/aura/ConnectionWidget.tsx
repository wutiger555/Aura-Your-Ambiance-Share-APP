import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Heart } from 'lucide-react-native';

interface ConnectionWidgetProps {
  onPress: () => void;
}

/**
 * ConnectionWidget - Compact floating heart button
 * Bottom-right corner entry point to "Your Connection" settings
 * Replaces the message button with a more meaningful connection symbol
 */
export default function ConnectionWidget({
  onPress,
}: ConnectionWidgetProps) {
  // Breathing pulse animation
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    // Gentle breathing effect
    pulse.value = withRepeat(
      withTiming(1.08, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Glow effect
    glow.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.5,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        {/* Glow effect */}
        <Animated.View style={[styles.glow, glowStyle]} />

        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Heart icon */}
          <View style={styles.iconContainer}>
            <Heart size={24} color="#ec4899" fill="#ec4899" />
          </View>
        </Animated.View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
    borderRadius: 24,
    overflow: 'hidden',
    width: 64,
    height: 64,
  },
  blur: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    flex: 1,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ec4899',
    borderRadius: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  cities: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  distance: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
