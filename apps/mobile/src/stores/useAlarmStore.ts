import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmKitCapabilities } from '@aura/shared';

interface AlarmStore {
  alarms: Alarm[];

  // v2.8.0: AlarmKit capabilities tracking
  alarmKitCapabilities: AlarmKitCapabilities | null;

  // Alarm management
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  getAlarm: (id: string) => Alarm | undefined;
  getAllAlarms: () => Alarm[];
  getEnabledAlarms: () => Alarm[];

  // v2.8.0: AlarmKit capabilities management
  setAlarmKitCapabilities: (capabilities: AlarmKitCapabilities) => void;

  // v2.8.0: Migration helpers
  getAlarmsUsingNotifications: () => Alarm[];
  getAlarmsUsingAlarmKit: () => Alarm[];
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      alarmKitCapabilities: null, // v2.8.0

      // Alarm management
      addAlarm: (alarm) => {
        console.log('[AlarmStore] Adding alarm:', alarm.label);
        set((state) => ({
          alarms: [...state.alarms, alarm],
        }));
      },
      updateAlarm: (id, updates) => {
        console.log('[AlarmStore] Updating alarm:', id);
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updates } : alarm
          ),
        }));
      },
      deleteAlarm: (id) => {
        console.log('[AlarmStore] Deleting alarm:', id);
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },
      toggleAlarm: (id) => {
        console.log('[AlarmStore] Toggling alarm:', id);
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
          ),
        }));
      },
      getAlarm: (id) => {
        return get().alarms.find((alarm) => alarm.id === id);
      },
      getAllAlarms: () => {
        return get().alarms;
      },
      getEnabledAlarms: () => {
        return get().alarms.filter((alarm) => alarm.enabled);
      },

      // v2.8.0: AlarmKit capabilities management
      setAlarmKitCapabilities: (capabilities) => {
        console.log('[AlarmStore] Setting AlarmKit capabilities:', capabilities);
        set({ alarmKitCapabilities: capabilities });
      },

      // v2.8.0: Migration helpers
      getAlarmsUsingNotifications: () => {
        return get().alarms.filter((alarm) => alarm.notificationId && !alarm.alarmKitID);
      },
      getAlarmsUsingAlarmKit: () => {
        return get().alarms.filter((alarm) => alarm.alarmKitID);
      },
    }),
    {
      name: 'aura-alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
