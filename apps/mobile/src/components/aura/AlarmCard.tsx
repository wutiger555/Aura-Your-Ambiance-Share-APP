import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Alarm } from '@aura/shared';
import { formatAlarmTime, getRepeatDaysText } from '../../utils/alarmUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Globe, Trash2 } from 'lucide-react-native';

interface AlarmCardProps {
  alarm: Alarm;
  displayTime: { hour: number; minute: number }; // Time in local timezone
  referenceLocation: string; // Name of the reference location (my city or partner's city)
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  use24Hour?: boolean;
}

const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  displayTime,
  referenceLocation,
  onToggle,
  onEdit,
  onDelete,
  use24Hour = true,
}) => {
  const repeatText = getRepeatDaysText(alarm.repeatDays);

  return (
    <TouchableOpacity
      onPress={() => onEdit(alarm)}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={
          alarm.enabled
            ? ['rgba(6, 182, 212, 0.15)', 'rgba(147, 51, 234, 0.15)']
            : ['rgba(100, 100, 100, 0.1)', 'rgba(50, 50, 50, 0.1)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Left side: Time and label */}
          <View style={styles.leftSection}>
            <View style={styles.timeRow}>
              <Text
                style={[
                  styles.timeText,
                  !alarm.enabled && styles.disabledText,
                ]}
              >
                {formatAlarmTime(displayTime.hour, displayTime.minute, use24Hour)}
              </Text>
              <View style={styles.toggleContainer}>
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => onToggle(alarm.id)}
                  trackColor={{ false: '#374151', true: '#06b6d4' }}
                  thumbColor={alarm.enabled ? '#ffffff' : '#9ca3af'}
                  ios_backgroundColor="#374151"
                />
              </View>
            </View>

            {alarm.label && (
              <Text
                style={[
                  styles.labelText,
                  !alarm.enabled && styles.disabledText,
                ]}
              >
                {alarm.label}
              </Text>
            )}

            {/* Reference timezone indicator */}
            <View style={styles.infoRow}>
              <Globe size={14} color={alarm.enabled ? '#06b6d4' : '#6b7280'} />
              <Text
                style={[
                  styles.infoText,
                  !alarm.enabled && styles.disabledText,
                ]}
              >
                {alarm.timeZoneReference === 'my' ? 'Your' : "Partner's"} time (
                {referenceLocation})
              </Text>
            </View>

            {/* Repeat days */}
            <View style={styles.infoRow}>
              <Clock size={14} color={alarm.enabled ? '#06b6d4' : '#6b7280'} />
              <Text
                style={[
                  styles.infoText,
                  !alarm.enabled && styles.disabledText,
                ]}
              >
                {repeatText}
              </Text>
            </View>
          </View>

          {/* Right side: Delete button */}
          <TouchableOpacity
            onPress={() => onDelete(alarm.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2
              size={20}
              color={alarm.enabled ? '#ef4444' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -1,
  },
  toggleContainer: {
    marginLeft: 16,
  },
  labelText: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 8,
  },
  disabledText: {
    opacity: 0.4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default AlarmCard;
