import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAlarmStore } from '../../stores/useAlarmStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useWeatherStore } from '../../stores/useWeatherStore';
import { getNextAlarmTriggerTime, formatAlarmTime } from '../../utils/alarmUtils';
import { Bell } from 'lucide-react-native';

interface AlarmCountdownProps {
  // Optional: control visibility based on display settings
  visible?: boolean;
}

/**
 * AlarmCountdown - Subtle countdown indicator for upcoming alarms
 * v2.7.0: Shows time remaining until next alarm (only if within 24 hours)
 *
 * Design principles:
 * - Minimal and non-intrusive
 * - Glass-morphism design matching Aura aesthetic
 * - Auto-updates every minute
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
  } | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<string>('');

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

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimeRemaining();

    // Update every second for real-time countdown
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextAlarm]);

  // Don't render if no alarm or not visible
  if (!visible || !nextAlarm || !timeRemaining) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={25} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Bell icon */}
          <Bell size={14} color="#06b6d4" strokeWidth={2} />

          {/* Time remaining */}
          <Text style={styles.timeText}>{timeRemaining}</Text>

          {/* Alarm time */}
          <Text style={styles.separator}>•</Text>
          <Text style={styles.alarmTimeText}>{nextAlarm.timeString}</Text>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    right: 20,
    zIndex: 50, // Above most elements, below modals
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    // Subtle glow
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
    letterSpacing: 0.3,
  },
  separator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  alarmTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.3,
  },
});

export default AlarmCountdown;
