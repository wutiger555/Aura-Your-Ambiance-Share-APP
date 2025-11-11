import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Alarm } from '@aura/shared';
import { X, Clock, Globe, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AlarmEditModalProps {
  visible: boolean;
  alarm?: Alarm; // If provided, edit mode; otherwise, create mode
  myLocationName: string;
  partnerLocationName: string;
  onSave: (alarmData: Partial<Alarm>) => void;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { short: 'Sun', full: 'Sunday', value: 0 },
  { short: 'Mon', full: 'Monday', value: 1 },
  { short: 'Tue', full: 'Tuesday', value: 2 },
  { short: 'Wed', full: 'Wednesday', value: 3 },
  { short: 'Thu', full: 'Thursday', value: 4 },
  { short: 'Fri', full: 'Friday', value: 5 },
  { short: 'Sat', full: 'Saturday', value: 6 },
];

const AlarmEditModal: React.FC<AlarmEditModalProps> = ({
  visible,
  alarm,
  myLocationName,
  partnerLocationName,
  onSave,
  onClose,
}) => {
  const [label, setLabel] = useState('');
  const [timeZoneReference, setTimeZoneReference] = useState<'my' | 'partner'>('partner');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initialize form with alarm data when editing
  useEffect(() => {
    if (alarm) {
      setLabel(alarm.label);
      setTimeZoneReference(alarm.timeZoneReference);
      setHour(alarm.hour);
      setMinute(alarm.minute);
      setRepeatDays(alarm.repeatDays);
    } else {
      // Reset form for new alarm
      setLabel('');
      setTimeZoneReference('partner');
      setHour(9);
      setMinute(0);
      setRepeatDays([]);
    }
  }, [alarm, visible]);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
    }
  };

  const toggleRepeatDay = (day: number) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day));
    } else {
      setRepeatDays([...repeatDays, day].sort());
    }
  };

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert('Label Required', 'Please enter a label for your alarm.');
      return;
    }

    onSave({
      label: label.trim(),
      timeZoneReference,
      hour,
      minute,
      repeatDays,
      enabled: true,
      sound: 'default',
      vibrate: true,
    });

    onClose();
  };

  const selectedDate = new Date();
  selectedDate.setHours(hour);
  selectedDate.setMinutes(minute);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1e1b4b', '#312e81', '#1e293b']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {alarm ? 'Edit Alarm' : 'New Alarm'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={28} color="#e0e7ff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Time Picker */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={20} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              {/* Timezone Reference */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Globe size={20} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Time Zone</Text>
                </View>
                <View style={styles.timezoneButtons}>
                  <TouchableOpacity
                    style={[
                      styles.timezoneButton,
                      timeZoneReference === 'my' && styles.timezoneButtonActive,
                    ]}
                    onPress={() => setTimeZoneReference('my')}
                  >
                    <Text
                      style={[
                        styles.timezoneButtonText,
                        timeZoneReference === 'my' && styles.timezoneButtonTextActive,
                      ]}
                    >
                      Your Time
                    </Text>
                    <Text style={styles.timezoneLocationText}>{myLocationName}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.timezoneButton,
                      timeZoneReference === 'partner' && styles.timezoneButtonActive,
                    ]}
                    onPress={() => setTimeZoneReference('partner')}
                  >
                    <Text
                      style={[
                        styles.timezoneButtonText,
                        timeZoneReference === 'partner' && styles.timezoneButtonTextActive,
                      ]}
                    >
                      Partner's Time
                    </Text>
                    <Text style={styles.timezoneLocationText}>{partnerLocationName}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Label */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Label</Text>
                <TextInput
                  style={styles.input}
                  value={label}
                  onChangeText={setLabel}
                  placeholder="e.g., Wake up Alex ❤️"
                  placeholderTextColor="#6b7280"
                  maxLength={50}
                />
              </View>

              {/* Repeat Days */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Calendar size={20} color="#06b6d4" />
                  <Text style={styles.sectionTitle}>Repeat</Text>
                </View>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        repeatDays.includes(day.value) && styles.dayButtonActive,
                      ]}
                      onPress={() => toggleRepeatDay(day.value)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          repeatDays.includes(day.value) && styles.dayButtonTextActive,
                        ]}
                      >
                        {day.short}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.helperText}>
                  {repeatDays.length === 0
                    ? 'One-time alarm'
                    : `Repeats ${repeatDays.length === 7 ? 'every day' : 'on selected days'}`}
                </Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <LinearGradient
                  colors={['#06b6d4', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e7ff',
    marginLeft: 8,
  },
  timePickerButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
  timezoneButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timezoneButton: {
    flex: 1,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timezoneButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  timezoneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  timezoneButtonTextActive: {
    color: '#ffffff',
  },
  timezoneLocationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    borderColor: '#9333ea',
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AlarmEditModal;
