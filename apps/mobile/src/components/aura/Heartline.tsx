import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Globe, Clock } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartlineProps {
  distance: number | null;
  timeDifference: number | null;
  onShowDetails: () => void;
}

/**
 * Heartline - SVG connection curve with interactive button
 * Displays distance and time difference between locations
 */
const Heartline: React.FC<HeartlineProps> = ({
  distance,
  timeDifference,
  onShowDetails,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* SVG connection curve */}
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
        style={styles.svg}
        pointerEvents="none"
      >
        {/* Curved path connecting top and bottom */}
        <Path
          d={`M ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.85} Q ${SCREEN_WIDTH * 0.8},${SCREEN_HEIGHT / 2} ${SCREEN_WIDTH / 2},${SCREEN_HEIGHT * 0.15}`}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="7, 3"
        />
      </Svg>

      {/* Interactive button in center */}
      <TouchableOpacity
        style={styles.button}
        onPress={onShowDetails}
        activeOpacity={0.8}
      >
        {distance !== null && (
          <View style={styles.stat}>
            <Globe size={16} color="white" />
            <Text style={styles.statText}>
              {Math.round(distance).toLocaleString()} km
            </Text>
          </View>
        )}

        {distance !== null && timeDifference !== null && (
          <View style={styles.divider} />
        )}

        {timeDifference !== null && (
          <View style={styles.stat}>
            <Clock size={16} color="white" />
            <Text style={styles.statText}>
              {timeDifference >= 0 ? '+' : ''}
              {timeDifference}h
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 10, 20, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default Heartline;
