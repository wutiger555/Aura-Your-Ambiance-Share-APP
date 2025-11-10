import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingsButtonProps {
  onPress: () => void;
}

/**
 * SettingsButton - Elegant gear icon with subtle animations
 * v2.6.0: Replaces ConnectionWidget with a refined settings entry point
 *
 * Design features:
 * - Glass morphism effect with BlurView
 * - Gradient border (cyan → purple, echoing day/night theme)
 * - Ultra-slow continuous rotation (30s per cycle, barely noticeable)
 * - Breathing glow pulse synchronized with Heartline
 * - Press interaction: brief spin + scale effect
 */
export default function SettingsButton({ onPress }: SettingsButtonProps) {
  // Ultra-slow continuous rotation (30 seconds per full rotation)
  const rotation = useSharedValue(0);

  // Breathing glow pulse (4s cycle, matching Heartline)
  const glowPulse = useSharedValue(0.4);

  // Press animation
  const pressScale = useSharedValue(1);

  useEffect(() => {
    // Continuous slow rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 30000, // 30 seconds
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Breathing glow pulse
    glowPulse.value = withRepeat(
      withTiming(0.8, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const handlePress = () => {
    // Brief spin and scale on press
    pressScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );

    rotation.value = withSequence(
      withTiming(rotation.value + 120, { duration: 300, easing: Easing.out(Easing.cubic) }),
      withTiming(rotation.value + 360, { duration: 30000, easing: Easing.linear })
    );

    onPress();
  };

  const animatedGearStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: pressScale.value },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value * 0.6,
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.container}
    >
      {/* Gradient border container */}
      <LinearGradient
        colors={['rgba(6, 182, 212, 0.6)', 'rgba(147, 51, 234, 0.6)', 'rgba(236, 72, 153, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        {/* Inner blur container */}
        <BlurView intensity={80} tint="dark" style={styles.blur}>
          {/* Animated glow effect */}
          <Animated.View style={[styles.glow, animatedGlowStyle]} />

          {/* Gear icon with rotation */}
          <Animated.View style={[styles.iconContainer, animatedGearStyle]}>
            <Settings size={26} color="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
          </Animated.View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  gradientBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2, // Border width
  },
  blur: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 20, 0.4)', // Slight tint for depth
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#a78bfa', // Purple glow
    borderRadius: 30,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
