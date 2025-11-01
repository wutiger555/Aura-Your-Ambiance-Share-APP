import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, AlertTriangle, Info } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { WeatherData, LocationData } from '@aura/shared';
import { getDSTInfo } from '../../utils/dstUtils';

interface DSTPanelProps {
  myLocation: LocationData;
  partnerLocation: LocationData;
  myWeather: WeatherData;
  partnerWeather: WeatherData;
  currentTimeDiff: number; // Current time difference in hours
  onShowDetails?: () => void;
}

/**
 * DSTPanel - Prominent DST status and transition warnings
 *
 * Design: Shows DST status for both locations with clear visual indicators
 * - Highlights upcoming DST transitions (critical for cross-timezone couples)
 * - Shows time difference changes when DST transitions occur
 * - Positioned prominently near Heartline for visibility
 */
export default function DSTPanel({
  myLocation,
  partnerLocation,
  myWeather,
  partnerWeather,
  currentTimeDiff,
  onShowDetails,
}: DSTPanelProps) {
  // Get DST info for both locations
  const myDST = useMemo(() => {
    if (!myWeather?.timezone) return null;
    return getDSTInfo(myWeather.timezone);
  }, [myWeather?.timezone]);

  const partnerDST = useMemo(() => {
    if (!partnerWeather?.timezone) return null;
    return getDSTInfo(partnerWeather.timezone);
  }, [partnerWeather?.timezone]);

  // Check if either location has upcoming transition
  const hasWarning = myDST?.transitionWarning || partnerDST?.transitionWarning;
  const upcomingTransition = myDST?.transitionWarning || partnerDST?.transitionWarning;
  const transitionLocation = myDST?.transitionWarning
    ? myLocation.nickname || myLocation.city
    : partnerLocation.nickname || partnerLocation.city;

  // Pulse animation for warning
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (hasWarning) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [hasWarning]);

  const warningAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  // Don't show if neither location observes DST
  const neitherObservesDST =
    myDST?.standardOffset === myDST?.dstOffset &&
    partnerDST?.standardOffset === partnerDST?.dstOffset;

  if (neitherObservesDST || !myDST || !partnerDST) return null;

  // Calculate time diff change when DST transitions
  const willTimeDiffChange = () => {
    const myObservesDST = myDST.standardOffset !== myDST.dstOffset;
    const partnerObservesDST = partnerDST.standardOffset !== partnerDST.dstOffset;

    // If only one observes DST and has upcoming transition, time diff will change
    if (myObservesDST !== partnerObservesDST) {
      return myDST.transitionWarning || partnerDST.transitionWarning ? 1 : 0;
    }

    // If both observe DST but transitions don't happen at same time
    if (myDST.transitionWarning && !partnerDST.transitionWarning) return 1;
    if (!myDST.transitionWarning && partnerDST.transitionWarning) return 1;

    return 0;
  };

  const timeDiffChange = willTimeDiffChange();

  // Render warning state (prominent)
  if (hasWarning) {
    return (
      <Animated.View
        entering={FadeIn.duration(600)}
        style={[styles.warningPanel, warningAnimatedStyle]}
      >
        <View style={styles.warningHeader}>
          <AlertTriangle size={22} color="#fb923c" strokeWidth={2.5} />
          <Text style={styles.warningTitle}>Time Change Alert</Text>
        </View>

        <View style={styles.warningContent}>
          <Text style={styles.locationName}>{transitionLocation}</Text>
          <Text style={styles.transitionText}>{upcomingTransition}</Text>

          {timeDiffChange > 0 && (
            <View style={styles.timeDiffChange}>
              <Clock size={16} color="#fbbf24" />
              <Text style={styles.timeDiffChangeText}>
                Time difference will change by {timeDiffChange} hour
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onShowDetails}
          activeOpacity={0.7}
        >
          <Info size={14} color="#fde047" />
          <Text style={styles.detailsButtonText}>View Time Details</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Render normal state (compact status)
  const myObservesDST = myDST.standardOffset !== myDST.dstOffset;
  const partnerObservesDST = partnerDST.standardOffset !== partnerDST.dstOffset;

  // Only show if at least one location observes DST
  if (!myObservesDST && !partnerObservesDST) return null;

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.normalPanel}>
      <View style={styles.statusRow}>
        {myObservesDST && (
          <View style={[styles.statusBadge, myDST.isDST ? styles.dstActive : styles.dstInactive]}>
            <Clock size={12} color={myDST.isDST ? '#10b981' : '#94a3b8'} />
            <Text style={[styles.statusText, myDST.isDST ? styles.activeText : styles.inactiveText]}>
              {myLocation.nickname || myLocation.city}
            </Text>
            <Text style={[styles.statusLabel, myDST.isDST ? styles.activeText : styles.inactiveText]}>
              {myDST.isDST ? 'DST' : 'STD'}
            </Text>
          </View>
        )}

        {partnerObservesDST && (
          <View style={[styles.statusBadge, partnerDST.isDST ? styles.dstActive : styles.dstInactive]}>
            <Clock size={12} color={partnerDST.isDST ? '#10b981' : '#94a3b8'} />
            <Text style={[styles.statusText, partnerDST.isDST ? styles.activeText : styles.inactiveText]}>
              {partnerLocation.nickname || partnerLocation.city}
            </Text>
            <Text style={[styles.statusLabel, partnerDST.isDST ? styles.activeText : styles.inactiveText]}>
              {partnerDST.isDST ? 'DST' : 'STD'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Warning panel (prominent when transition is coming)
  warningPanel: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.6)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fb923c',
    letterSpacing: 0.5,
  },
  warningContent: {
    marginBottom: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 6,
  },
  transitionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fde047',
    lineHeight: 18,
    marginBottom: 10,
  },
  timeDiffChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  timeDiffChangeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#fde047',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(253, 224, 71, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fde047',
  },

  // Normal panel (compact status)
  normalPanel: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dstActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  dstInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeText: {
    color: '#10b981',
  },
  inactiveText: {
    color: '#cbd5e1',
  },
});
