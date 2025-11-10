import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraEffectProps {
  /** Aurora color theme: 'green' (northern) or 'pink' (rare southern) */
  theme?: 'green' | 'pink' | 'purple';
  /** Intensity of the effect (0-1) */
  intensity?: number;
}

/**
 * AuroraEffect - Ethereal aurora borealis effect
 *
 * Displays flowing, wave-like aurora lights in the sky
 * Only shown at night in appropriate conditions
 *
 * Design: Inspired by the connection theme - like energy flowing between two people
 */
const AuroraEffect: React.FC<AuroraEffectProps> = ({
  theme = 'green',
  intensity = 0.6,
}) => {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.2)).current;

  // Aurora color palettes
  const colors = {
    green: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.4)', 'rgba(52, 211, 153, 0.3)', 'rgba(16, 185, 129, 0)'],
    pink: ['rgba(236, 72, 153, 0)', 'rgba(236, 72, 153, 0.4)', 'rgba(244, 114, 182, 0.3)', 'rgba(236, 72, 153, 0)'],
    purple: ['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.4)', 'rgba(196, 181, 253, 0.3)', 'rgba(167, 139, 250, 0)'],
  };

  useEffect(() => {
    // Wave animations - slow, organic movement
    const waveAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, {
          toValue: 30,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1, {
          toValue: -30,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, {
          toValue: -40,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 40,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave3, {
          toValue: 20,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3, {
          toValue: -20,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    );

    // Opacity pulsing for shimmer effect
    const opacityAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity1, {
          toValue: 0.5 * intensity,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0.2 * intensity,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity2, {
          toValue: 0.4 * intensity,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0.15 * intensity,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    );

    waveAnimation1.start();
    waveAnimation2.start();
    waveAnimation3.start();
    opacityAnimation1.start();
    opacityAnimation2.start();

    return () => {
      waveAnimation1.stop();
      waveAnimation2.stop();
      waveAnimation3.stop();
      opacityAnimation1.stop();
      opacityAnimation2.stop();
    };
  }, [intensity]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Wave 1 - Top layer */}
      <Animated.View
        style={[
          styles.wave,
          {
            top: '15%',
            opacity: opacity1,
            transform: [{ translateX: wave1 }],
          },
        ]}
      >
        <LinearGradient
          colors={colors[theme]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Wave 2 - Middle layer */}
      <Animated.View
        style={[
          styles.wave,
          {
            top: '20%',
            opacity: opacity2,
            transform: [{ translateX: wave2 }],
          },
        ]}
      >
        <LinearGradient
          colors={colors[theme]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Wave 3 - Background layer */}
      <Animated.View
        style={[
          styles.wave,
          {
            top: '25%',
            opacity: 0.15 * intensity,
            transform: [{ translateX: wave3 }],
          },
        ]}
      >
        <LinearGradient
          colors={colors[theme]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  wave: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: 150,
    left: -SCREEN_WIDTH * 0.25,
  },
  gradient: {
    flex: 1,
    borderRadius: 100,
  },
});

export default AuroraEffect;
