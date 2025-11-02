import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartlineParticlesProps {
  particleCount?: number;
  myColor: string; // Color from my weather
  partnerColor: string; // Color from partner's weather
}

interface Particle {
  id: number;
  delay: number;
  duration: number;
  direction: 'up' | 'down'; // up: me to partner, down: partner to me
}

/**
 * HeartlineParticles - Animated particles flowing along the connection curve
 * Represents the continuous flow of connection between two people
 */
const HeartlineParticles: React.FC<HeartlineParticlesProps> = ({
  particleCount = 8,
  myColor,
  partnerColor,
}) => {
  // Generate particles with randomized properties
  const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    delay: (i / particleCount) * 5000, // Stagger over 5 seconds
    duration: 4000 + Math.random() * 2000, // 4-6 seconds travel time
    direction: i % 2 === 0 ? 'up' : 'down', // Alternate directions
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <FlowingParticle
          key={particle.id}
          delay={particle.delay}
          duration={particle.duration}
          direction={particle.direction}
          color={particle.direction === 'up' ? myColor : partnerColor}
        />
      ))}
    </View>
  );
};

interface FlowingParticleProps {
  delay: number;
  duration: number;
  direction: 'up' | 'down';
  color: string;
}

const FlowingParticle: React.FC<FlowingParticleProps> = ({
  delay,
  duration,
  direction,
  color,
}) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate progress from 0 to 1 along the curve
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      )
    );

    // Fade in at start, fade out at end
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true // Reverse to fade out
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position along the bezier curve
    // The curve goes from bottom (me) to top (partner)
    const t = direction === 'up' ? progress.value : 1 - progress.value;

    // Bezier curve formula: Q(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    // P₀: start point (bottom center)
    // P₁: control point (right center)
    // P₂: end point (top center)
    const x0 = SCREEN_WIDTH / 2;
    const y0 = SCREEN_HEIGHT * 0.85;
    const x1 = SCREEN_WIDTH * 0.8; // Control point (curve to the right)
    const y1 = SCREEN_HEIGHT / 2;
    const x2 = SCREEN_WIDTH / 2;
    const y2 = SCREEN_HEIGHT * 0.15;

    const x =
      Math.pow(1 - t, 2) * x0 +
      2 * (1 - t) * t * x1 +
      Math.pow(t, 2) * x2;

    const y =
      Math.pow(1 - t, 2) * y0 +
      2 * (1 - t) * t * y1 +
      Math.pow(t, 2) * y2;

    return {
      left: x,
      top: y,
      opacity: opacity.value * 0.8, // Max 0.8 for subtle effect
      transform: [{ scale: 0.8 + opacity.value * 0.4 }], // Pulse while moving
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default HeartlineParticles;
