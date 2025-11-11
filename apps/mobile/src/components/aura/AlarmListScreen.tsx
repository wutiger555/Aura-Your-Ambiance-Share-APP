import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Plus, Bell } from 'lucide-react-native';
import { Alarm } from '@aura/shared';
import { useAlarmStore } from '../../stores/useAlarmStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useWeatherStore } from '../../stores/useWeatherStore';
import AlarmCard from './AlarmCard';
import AlarmEditModal from './AlarmEditModal';
import {
  convertAlarmTimeToLocal,
  generateAlarmId,
} from '../../utils/alarmUtils';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../../utils/notificationService';

interface AlarmListScreenProps {
  visible: boolean;
  onClose: () => void;
}

const AlarmListScreen: React.FC<AlarmListScreenProps> = ({
  visible,
  onClose,
}) => {
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useAlarmStore();
  const { myLocation, partnerLocation } = useLocationStore();
  const { myWeather, partnerWeather } = useWeatherStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>(undefined);

  // Get timezones
  const myTimezone = myWeather?.timezone || 'UTC';
  const partnerTimezone = partnerWeather?.timezone || 'UTC';

  // Handle adding new alarm
  const handleAddAlarm = () => {
    setEditingAlarm(undefined);
    setShowEditModal(true);
  };

  // Handle editing existing alarm
  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setShowEditModal(true);
  };

  // Handle saving alarm (create or update)
  const handleSaveAlarm = async (alarmData: Partial<Alarm>) => {
    try {
      if (editingAlarm) {
        // Update existing alarm
        const updatedAlarm = { ...editingAlarm, ...alarmData };

        // Cancel old notification
        if (editingAlarm.notificationId) {
          await cancelAlarmNotification(editingAlarm.notificationId);
        }

        // Schedule new notification
        const referenceTimezone = updatedAlarm.timeZoneReference === 'my' ? myTimezone : partnerTimezone;
        const notificationId = await scheduleAlarmNotification(
          updatedAlarm,
          referenceTimezone,
          myTimezone
        );

        updateAlarm(editingAlarm.id, {
          ...alarmData,
          notificationId,
        });
      } else {
        // Create new alarm
        const newAlarm: Alarm = {
          id: generateAlarmId(),
          label: alarmData.label || '',
          timeZoneReference: alarmData.timeZoneReference || 'partner',
          hour: alarmData.hour || 9,
          minute: alarmData.minute || 0,
          enabled: true,
          repeatDays: alarmData.repeatDays || [],
          sound: 'default',
          vibrate: true,
          createdAt: new Date().toISOString(),
        };

        // Schedule notification
        const referenceTimezone = newAlarm.timeZoneReference === 'my' ? myTimezone : partnerTimezone;
        const notificationId = await scheduleAlarmNotification(
          newAlarm,
          referenceTimezone,
          myTimezone
        );

        newAlarm.notificationId = notificationId;
        addAlarm(newAlarm);
      }
    } catch (error) {
      console.error('[AlarmListScreen] Failed to save alarm:', error);
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    }
  };

  // Handle deleting alarm
  const handleDeleteAlarm = async (id: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const alarm = alarms.find((a) => a.id === id);
            if (alarm?.notificationId) {
              await cancelAlarmNotification(alarm.notificationId);
            }
            deleteAlarm(id);
          },
        },
      ]
    );
  };

  // Handle toggling alarm on/off
  const handleToggleAlarm = async (id: string) => {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;

    const newEnabledState = !alarm.enabled;

    if (newEnabledState) {
      // Re-enable: schedule notification
      try {
        const referenceTimezone = alarm.timeZoneReference === 'my' ? myTimezone : partnerTimezone;
        const notificationId = await scheduleAlarmNotification(
          alarm,
          referenceTimezone,
          myTimezone
        );
        updateAlarm(id, { enabled: true, notificationId });
      } catch (error) {
        console.error('[AlarmListScreen] Failed to enable alarm:', error);
        Alert.alert('Error', 'Failed to enable alarm.');
      }
    } else {
      // Disable: cancel notification
      if (alarm.notificationId) {
        await cancelAlarmNotification(alarm.notificationId);
      }
      updateAlarm(id, { enabled: false, notificationId: undefined });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <BlurView intensity={20} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#0a0118', '#1e1b4b', '#312e81']}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Bell size={28} color="#06b6d4" />
                <Text style={styles.headerTitle}>Alarms</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={28} color="#e0e7ff" />
              </TouchableOpacity>
            </View>

            {/* Alarm List */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {alarms.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bell size={64} color="#6b7280" />
                  <Text style={styles.emptyStateTitle}>No Alarms Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Create your first multi-timezone alarm to stay connected
                    across distances
                  </Text>
                </View>
              ) : (
                alarms.map((alarm) => {
                  // Calculate display time in local timezone
                  const referenceTimezone =
                    alarm.timeZoneReference === 'my' ? myTimezone : partnerTimezone;
                  const localTime = convertAlarmTimeToLocal(
                    alarm,
                    referenceTimezone,
                    myTimezone
                  );

                  // Get reference location name
                  const referenceLocation =
                    alarm.timeZoneReference === 'my'
                      ? myLocation?.name || 'Your location'
                      : partnerLocation?.name || "Partner's location";

                  return (
                    <AlarmCard
                      key={alarm.id}
                      alarm={alarm}
                      displayTime={localTime}
                      referenceLocation={referenceLocation}
                      onToggle={handleToggleAlarm}
                      onEdit={handleEditAlarm}
                      onDelete={handleDeleteAlarm}
                    />
                  );
                })
              )}
            </ScrollView>

            {/* Add Alarm Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAlarm}
              >
                <LinearGradient
                  colors={['#06b6d4', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <Plus size={24} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Alarm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>

      {/* Edit/Create Alarm Modal */}
      {myLocation && partnerLocation && (
        <AlarmEditModal
          visible={showEditModal}
          alarm={editingAlarm}
          myLocationName={myLocation.name}
          partnerLocationName={partnerLocation.name}
          onSave={handleSaveAlarm}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e0e7ff',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: 'rgba(10, 1, 24, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default AlarmListScreen;
