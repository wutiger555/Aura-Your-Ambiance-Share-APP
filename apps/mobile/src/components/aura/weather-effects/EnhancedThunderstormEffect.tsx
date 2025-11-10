import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EnhancedThunderstormEffectProps {
  isDay: boolean;
}

interface LightningBolt {
  id: number;
  startX: number;
  opacity: Animated.Value;
  segments: LightningSegment[];
}

interface LightningSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
}

/**
 * EnhancedThunderstormEffect - Realistic branching lightning
 *
 * Features:
 * - Branching lightning bolts with multiple segments
 * - Random flash intervals (5-12 seconds)
 * - Brief intense flash + sky illumination
 * - Procedurally generated bolt paths
 * - Uses native Animated API
 */
const EnhancedThunderstormEffect: React.FC<EnhancedThunderstormEffectProps> = ({ isDay }) => {
  const [currentBolt, setCurrentBolt] = useState<LightningBolt | null>(null);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const skyFlashOpacity = useRef(new Animated.Value(0)).current;

  // Generate a lightning bolt with branching
  const generateLightningBolt = (): LightningBolt => {
    const startX = 20 + Math.random() * 60; // Start in middle 60% of screen
    const segments: LightningSegment[] = [];

    // Main trunk
    let currentX = startX;
    let currentY = 0;
    const trunkSegments = 8 + Math.floor(Math.random() * 4); // 8-11 segments

    for (let i = 0; i < trunkSegments; i++) {
      const segmentHeight = 8 + Math.random() * 6; // 8-14% height per segment
      const horizontalJitter = (Math.random() - 0.5) * 8; // -4 to +4% horizontal deviation
      const endX = currentX + horizontalJitter;
      const endY = currentY + segmentHeight;

      segments.push({
        startX: currentX,
        startY: currentY,
        endX,
        endY,
        width: 3,
      });

      // Add branches (30% chance per segment)
      if (Math.random() < 0.3 && i > 2) {
        const branchLength = 2 + Math.floor(Math.random() * 3); // 2-4 segments
        let branchX = currentX;
        let branchY = currentY;

        for (let b = 0; b < branchLength; b++) {
          const branchHeight = 5 + Math.random() * 4;
          const branchHorizontal = (Math.random() - 0.5) * 12;
          const branchEndX = branchX + branchHorizontal;
          const branchEndY = branchY + branchHeight;

          segments.push({
            startX: branchX,
            startY: branchY,
            endX: branchEndX,
            endY: branchEndY,
            width: 1.5,
          });

          branchX = branchEndX;
          branchY = branchEndY;
        }
      }

      currentX = endX;
      currentY = endY;

      if (currentY > 100) break; // Don't go past screen
    }

    return {
      id: Date.now(),
      startX,
      opacity: new Animated.Value(0),
      segments,
    };
  };

  useEffect(() => {
    const triggerLightning = () => {
      const bolt = generateLightningBolt();
      setCurrentBolt(bolt);

      // Lightning flash sequence
      Animated.sequence([
        // Initial bright flash
        Animated.parallel([
          Animated.timing(bolt.opacity, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0.8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(skyFlashOpacity, {
            toValue: 0.3,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
        // Brief hold
        Animated.delay(30),
        // Fade out
        Animated.parallel([
          Animated.timing(bolt.opacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(skyFlashOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Sometimes a second flicker
        ...(Math.random() < 0.4 ? [
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(bolt.opacity, {
              toValue: 0.6,
              duration: 40,
              useNativeDriver: true,
            }),
            Animated.timing(flashOpacity, {
              toValue: 0.4,
              duration: 40,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bolt.opacity, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(flashOpacity, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true,
            }),
          ]),
        ] : []),
      ]).start(() => {
        setCurrentBolt(null);
      });

      // Schedule next lightning
      const nextDelay = 5000 + Math.random() * 7000; // 5-12 seconds
      setTimeout(triggerLightning, nextDelay);
    };

    // Initial lightning after 2 seconds
    const initialTimeout = setTimeout(triggerLightning, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Sky flash overlay */}
      <Animated.View
        style={[
          styles.skyFlash,
          {
            backgroundColor: isDay ? 'rgba(255, 255, 255, 0.9)' : 'rgba(200, 220, 255, 0.8)',
            opacity: skyFlashOpacity,
          },
        ]}
      />

      {/* Lightning bolt */}
      {currentBolt && (
        <Animated.View style={[styles.boltContainer, { opacity: currentBolt.opacity }]}>
          {currentBolt.segments.map((segment, index) => {
            const startXPx = (segment.startX / 100) * SCREEN_WIDTH;
            const startYPx = (segment.startY / 100) * SCREEN_HEIGHT;
            const endXPx = (segment.endX / 100) * SCREEN_WIDTH;
            const endYPx = (segment.endY / 100) * SCREEN_HEIGHT;

            const length = Math.sqrt(
              Math.pow(endXPx - startXPx, 2) + Math.pow(endYPx - startYPx, 2)
            );
            const angle = Math.atan2(endYPx - startYPx, endXPx - startXPx) * (180 / Math.PI);

            return (
              <View
                key={index}
                style={[
                  styles.boltSegment,
                  {
                    left: startXPx,
                    top: startYPx,
                    width: length,
                    height: segment.width,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              >
                {/* Inner bright core */}
                <View style={styles.boltCore} />
                {/* Outer glow */}
                <View style={styles.boltGlow} />
              </View>
            );
          })}

          {/* Flash at bolt origin */}
          <Animated.View
            style={[
              styles.originFlash,
              {
                left: (currentBolt.startX / 100) * SCREEN_WIDTH - 30,
                opacity: flashOpacity,
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  skyFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boltContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boltSegment: {
    position: 'absolute',
    overflow: 'visible',
  },
  boltCore: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#7dd3fc',
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  boltGlow: {
    position: 'absolute',
    width: '100%',
    height: '200%',
    top: '-50%',
    backgroundColor: 'rgba(125, 211, 252, 0.6)',
    shadowColor: '#7dd3fc',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  originFlash: {
    position: 'absolute',
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#7dd3fc',
    shadowOpacity: 1,
    shadowRadius: 20,
  },
});

export default EnhancedThunderstormEffect;
