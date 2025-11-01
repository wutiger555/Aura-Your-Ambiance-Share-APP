import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertTriangle } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { WeatherData } from '@aura/shared';
import { getDSTInfo } from '../../utils/dstUtils';

interface DSTIndicatorProps {
  weather: WeatherData;
  position: 'top' | 'bottom';
}

export default function DSTIndicator({ weather, position }: DSTIndicatorProps) {
  const dstInfo = useMemo(() => {
    if (!weather?.timezone) return null;
    return getDSTInfo(weather.timezone);
  }, [weather?.timezone]);

  // Pulse animation for warning
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (dstInfo?.transitionWarning) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [dstInfo?.transitionWarning]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!dstInfo) return null;

  const isDST = dstInfo.isDST;
  const hasWarning = !!dstInfo.transitionWarning;
  const noDST = dstInfo.standardOffset === dstInfo.dstOffset;

  // Don't show if location doesn't observe DST
  if (noDST) return null;

  return (
    <View style={[styles.container, position === 'top' ? styles.topPosition : styles.bottomPosition]}>
      {hasWarning ? (
        // Warning state - time change coming soon
        <Animated.View style={[styles.warningBadge, animatedStyle]}>
          <AlertTriangle size={16} color="#fb923c" />
          <View style={styles.textContainer}>
            <Text style={styles.warningTitle}>
              {isDST ? 'Ending Soon' : 'Starting Soon'}
            </Text>
            <Text style={styles.warningText}>
              {isDST ? 'Daylight Saving Time' : 'Standard Time'}
            </Text>
            <Text style={styles.warningSubtext}>{dstInfo.transitionWarning}</Text>
          </View>
        </Animated.View>
      ) : (
        // Normal state - showing current DST status with clearer labeling
        <View style={[styles.badge, isDST ? styles.dstBadge : styles.standardBadge]}>
          <Clock size={14} color={isDST ? '#10b981' : '#94a3b8'} />
          <View style={styles.textContainer}>
            <Text style={[styles.statusText, isDST ? styles.dstText : styles.standardText]}>
              {isDST ? 'Daylight Saving' : 'Standard Time'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    zIndex: 50,
  },
  topPosition: {
    top: 60,
  },
  bottomPosition: {
    bottom: 60,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dstBadge: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  standardBadge: {
    borderColor: 'rgba(148, 163, 184, 0.5)',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dstText: {
    color: '#10b981',
  },
  standardText: {
    color: '#cbd5e1',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 146, 60, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.6)',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 280,
  },
  textContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fb923c',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  warningSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fde047',
    lineHeight: 14,
  },
});
