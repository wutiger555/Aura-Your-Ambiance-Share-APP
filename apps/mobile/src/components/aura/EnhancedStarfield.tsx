import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  twinkleSpeed: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
}

interface EnhancedStarfieldProps {
  /** Density of stars (0-1) */
  density?: number;
  /** Whether shooting stars should appear */
  enableShootingStars?: boolean;
  /** Is it nighttime? (affects visibility) */
  isNight?: boolean;
}

/**
 * EnhancedStarfield - Premium starfield with twinkling and shooting stars
 *
 * Features:
 * - Twinkling stars with varied sizes and speeds
 * - Occasional shooting stars (meteors)
 * - Automatic density adjustment based on day/night
 * - Smooth animations using native driver
 * - Performance optimized with controlled star count
 */
const EnhancedStarfield: React.FC<EnhancedStarfieldProps> = ({
  density = 0.5,
  enableShootingStars = true,
  isNight = true,
}) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const shootingStarIdRef = useRef(0);

  // Generate stars on mount
  useEffect(() => {
    const starCount = Math.floor(30 * density); // Max 30 stars
    const generatedStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2 + 1, // 1-3px
        opacity: new Animated.Value(Math.random() * 0.5 + 0.3),
        twinkleSpeed: Math.random() * 2000 + 1500, // 1.5-3.5s
      });
    }

    setStars(generatedStars);

    // Start twinkling for each star
    generatedStars.forEach((star) => {
      startTwinkling(star);
    });
  }, [density]);

  // Twinkling animation for a star
  const startTwinkling = (star: Star) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.3 + 0.7, // 0.7-1.0
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.3 + 0.2, // 0.2-0.5
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Generate shooting stars periodically
  useEffect(() => {
    if (!enableShootingStars || !isNight) return;

    const interval = setInterval(() => {
      // 20% chance every 3 seconds
      if (Math.random() < 0.2) {
        createShootingStar();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enableShootingStars, isNight]);

  const createShootingStar = () => {
    const startX = Math.random() * SCREEN_WIDTH * 0.7 + SCREEN_WIDTH * 0.15; // Middle 70%
    const startY = Math.random() * SCREEN_HEIGHT * 0.3; // Top 30%

    const newStar: ShootingStar = {
      id: shootingStarIdRef.current++,
      startX,
      startY,
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    };

    setShootingStars((prev) => [...prev, newStar]);

    // Animate shooting star
    Animated.parallel([
      Animated.timing(newStar.translateX, {
        toValue: Math.random() * 200 + 150, // 150-350px
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(newStar.translateY, {
        toValue: Math.random() * 200 + 150, // 150-350px
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(newStar.opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(newStar.opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Remove shooting star after animation
      setShootingStars((prev) => prev.filter((s) => s.id !== newStar.id));
    });
  };

  if (!isNight) return null; // Don't show stars during day

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Twinkling stars */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.shootingStar,
            {
              left: star.startX,
              top: star.startY,
              opacity: star.opacity,
              transform: [
                { translateX: star.translateX },
                { translateY: star.translateY },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: 'white',
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  shootingStar: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 1,
    shadowColor: 'white',
    shadowOpacity: 1,
    shadowRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
});

export default EnhancedStarfield;
