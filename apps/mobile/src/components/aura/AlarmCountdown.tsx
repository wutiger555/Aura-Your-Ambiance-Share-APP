import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAlarmStore } from '../../stores/useAlarmStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useWeatherStore } from '../../stores/useWeatherStore';
import { getNextAlarmTriggerTime, formatAlarmTime } from '../../utils/alarmUtils';
import { Bell } from 'lucide-react-native';
import AlarmCountdownPopup from './AlarmCountdownPopup';

interface AlarmCountdownProps {
  // Optional: control visibility based on display settings
  visible?: boolean;
}

/**
 * AlarmCountdown - Minimal alarm indicator with expandable popup
 * v2.7.0: Redesigned for minimal footprint
 *
 * Design improvements:
 * - Small circular icon (40x40) with bell and time badge
 * - Breathing pulse animation for visual appeal
 * - Tap to expand full details in popup modal
 * - Only shows when alarm is within 24 hours
 */
const AlarmCountdown: React.FC<AlarmCountdownProps> = ({ visible = true }) => {
  const { getEnabledAlarms } = useAlarmStore();
  const { myLocation, partnerLocation } = useLocationStore();
  const { myWeather, partnerWeather } = useWeatherStore();

  const [nextAlarm, setNextAlarm] = useState<{
    label: string;
    time: Date;
    timeString: string;
    timeZoneReference?: 'my' | 'partner';
  } | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);

  // Breathing pulse animation for icon
  const pulseScale = useSharedValue(1);

  // Badge update animation for real-time countdown feel
  const badgeScale = useSharedValue(1);
  const badgeOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Badge animation for real-time countdown feel
  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  // Calculate next alarm
  useEffect(() => {
    const calculateNextAlarm = () => {
      if (!myLocation || !partnerLocation || !myWeather || !partnerWeather) {
        setNextAlarm(null);
        return;
      }

      const enabledAlarms = getEnabledAlarms();
      if (enabledAlarms.length === 0) {
        setNextAlarm(null);
        return;
      }

      // Find the soonest alarm
      let soonestAlarm: typeof nextAlarm = null;
      let soonestTime: Date | null = null;

      enabledAlarms.forEach((alarm) => {
        const referenceTimezone =
          alarm.timeZoneReference === 'my' ? myWeather.timezone : partnerWeather.timezone;
        const localTimezone = myWeather.timezone;

        const triggerTime = getNextAlarmTriggerTime(alarm, referenceTimezone, localTimezone);

        if (triggerTime) {
          const now = new Date();
          const hoursUntil = (triggerTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          // Only show if alarm is within 24 hours
          if (hoursUntil > 0 && hoursUntil <= 24) {
            if (!soonestTime || triggerTime < soonestTime) {
              soonestTime = triggerTime;
              soonestAlarm = {
                label: alarm.label || 'Alarm',
                time: triggerTime,
                timeString: formatAlarmTime(triggerTime.getHours(), triggerTime.getMinutes(), true),
                timeZoneReference: alarm.timeZoneReference,
              };
            }
          }
        }
      });

      setNextAlarm(soonestAlarm);
    };

    calculateNextAlarm();

    // Recalculate every minute
    const interval = setInterval(calculateNextAlarm, 60000);

    return () => clearInterval(interval);
  }, [getEnabledAlarms, myLocation, partnerLocation, myWeather, partnerWeather]);

  // Update time remaining display every second
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!nextAlarm) {
        setTimeRemaining('');
        return;
      }

      const now = new Date();
      const diffMs = nextAlarm.time.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('now');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const newTimeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Only update and animate if time actually changed
      if (newTimeString !== timeRemaining) {
        setTimeRemaining(newTimeString);

        // Trigger badge update animation for visual feedback
        badgeScale.value = withSequence(
          withTiming(1.15, { duration: 150, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 150, easing: Easing.inOut(Easing.cubic) })
        );
        badgeOpacity.value = withSequence(
          withTiming(0.7, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
      }
    };

    updateTimeRemaining();

    // Update every second for real-time countdown
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextAlarm, timeRemaining]);

  // Get compact time format for badge (e.g., "2h" or "45m")
  const getCompactTime = () => {
    if (!nextAlarm || !timeRemaining) return '';

    const now = new Date();
    const diffMs = nextAlarm.time.getTime() - now.getTime();

    if (diffMs <= 0) return 'now';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 30) {
      return `${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Don't render if no alarm or not visible
  if (!visible || !nextAlarm || !timeRemaining) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowPopup(true)}
          activeOpacity={0.85}
        >
          <BlurView
            intensity={60}
            tint="dark"
            style={styles.blurContainer}
          >
            <View style={styles.blurInner}>
              {/* Bell icon */}
              <Bell size={18} color="#06b6d4" strokeWidth={2.5} />

              {/* Time badge with real-time update animation */}
              <Animated.View style={[styles.badge, animatedBadgeStyle]}>
                <Text style={styles.badgeText}>{getCompactTime()}</Text>
              </Animated.View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Expandable popup with full details */}
      <AlarmCountdownPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        nextAlarm={nextAlarm}
        timeRemaining={timeRemaining}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70, // Aligned with adjusted AuraGlobeMinimal top position
    right: 20,
    zIndex: 50,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    // Subtle glow
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#06b6d4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(10, 1, 24, 0.9)',
    minWidth: 20,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default AlarmCountdown;
