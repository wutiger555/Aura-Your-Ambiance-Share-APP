import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  PARTICLE_CONFIG,
  ANIMATION_DURATIONS,
} from '../../constants/Animations';
import { generateParticles } from '../../utils/animationUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleSystemProps {
  count?: number;
  color?: string;
}

/**
 * ParticleSystem - Animated drifting particles for atmospheric effect
 * Optimized version of web's particle system (8 particles instead of 20)
 */
const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = PARTICLE_CONFIG.COUNT,
  color = 'rgba(255, 255, 255, 0.4)',
}) => {
  const particles = useMemo(
    () =>
      generateParticles(
        count,
        SCREEN_WIDTH,
        SCREEN_HEIGHT / 2, // Half screen height for each section
        PARTICLE_CONFIG.MIN_SIZE,
        PARTICLE_CONFIG.MAX_SIZE,
        PARTICLE_CONFIG.MIN_OPACITY,
        PARTICLE_CONFIG.MAX_OPACITY,
        ANIMATION_DURATIONS.PARTICLE_DRIFT
      ),
    [count]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          particle={particle}
          color={color}
        />
      ))}
    </View>
  );
};

interface ParticleProps {
  particle: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
  };
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ particle, color }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(particle.opacity);

  useEffect(() => {
    // Calculate drift amounts
    const driftX = particle.endX - particle.startX;
    const driftY = particle.endY - particle.startY;

    // Animate position with repeat
    translateX.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(driftX, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // Infinite repeat
        true // Reverse
      )
    );

    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(driftY, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    // Subtle opacity pulsing
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(particle.opacity * 0.5, {
          duration: particle.duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.startX,
          top: particle.startY,
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
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
  particle: {
    position: 'absolute',
    borderRadius: 100,
  },
});

export default ParticleSystem;
