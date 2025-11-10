import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EnhancedStarfieldProps {
  density?: number;
  enableShootingStars?: boolean;
  isNight?: boolean;
}

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
}

/**
 * EnhancedStarfield - Simplified starfield (non-animated for simulator compatibility)
 *
 * Features:
 * - Static twinkling stars at random positions
 * - No animations to avoid Native Animated limitations
 * - Performance optimized
 */
const EnhancedStarfield: React.FC<EnhancedStarfieldProps> = ({
  density = 0.6,
  enableShootingStars = false, // Disabled for now
  isNight = true,
}) => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    if (!isNight) {
      setStars([]);
      return;
    }

    const starCount = Math.floor(40 * density);
    const generatedStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      generatedStars.push({
        id: i,
        left: Math.random() * SCREEN_WIDTH,
        top: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2 + 1, // 1-3px
        opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
      });
    }

    setStars(generatedStars);
  }, [density, isNight]);

  if (!isNight || stars.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
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
});

export default EnhancedStarfield;
