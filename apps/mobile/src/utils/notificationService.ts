import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '@aura/shared';
import { convertAlarmTimeToLocal, getNextAlarmTriggerTime } from './alarmUtils';

// Configure notification handler (how notifications behave when app is foregrounded)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * @returns true if permissions granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[NotificationService] Notification permissions not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#06b6d4',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('[NotificationService] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Schedule an alarm notification
 * @param alarm - Alarm object
 * @param referenceTimezone - IANA timezone of the reference (my or partner's)
 * @param localTimezone - IANA timezone of the local device
 * @returns Notification ID or undefined if scheduling failed
 */
export async function scheduleAlarmNotification(
  alarm: Alarm,
  referenceTimezone: string,
  localTimezone: string
): Promise<string | undefined> {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[NotificationService] Cannot schedule alarm without permissions');
      return undefined;
    }

    // Calculate next trigger time
    const nextTrigger = getNextAlarmTriggerTime(alarm, referenceTimezone, localTimezone);
    if (!nextTrigger) {
      console.warn('[NotificationService] Cannot schedule alarm with past trigger time');
      return undefined;
    }

    // Convert alarm time to local timezone for display
    const { hour, minute } = convertAlarmTimeToLocal(
      alarm,
      referenceTimezone,
      localTimezone
    );

    // Schedule notification
    let notificationId: string;

    if (alarm.repeatDays.length === 0) {
      // One-time alarm
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 ' + alarm.label,
          body: `It's ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}!`,
          sound: alarm.sound === 'default' ? 'default' : alarm.sound,
          vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
          data: { alarmId: alarm.id },
        },
        trigger: nextTrigger,
      });
    } else {
      // Repeating alarm
      // Schedule for each day of the week
      const dayOfWeek = nextTrigger.getDay();

      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 ' + alarm.label,
          body: `It's ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}!`,
          sound: alarm.sound === 'default' ? 'default' : alarm.sound,
          vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
          data: { alarmId: alarm.id },
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
          // Note: expo-notifications doesn't support day-of-week directly for repeating notifications
          // We'll use daily repeat and manage the logic in the notification handler
        } as any, // Type assertion for compatibility
      });
    }

    console.log('[NotificationService] Scheduled alarm:', notificationId, 'Next trigger:', nextTrigger);
    return notificationId;
  } catch (error) {
    console.error('[NotificationService] Failed to schedule notification:', error);
    return undefined;
  }
}

/**
 * Cancel a scheduled alarm notification
 * @param notificationId - Expo notification ID
 */
export async function cancelAlarmNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('[NotificationService] Cancelled alarm notification:', notificationId);
  } catch (error) {
    console.error('[NotificationService] Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllAlarmNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] Cancelled all alarm notifications');
  } catch (error) {
    console.error('[NotificationService] Failed to cancel all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 * @returns Array of scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[NotificationService] Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('[NotificationService] Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Initialize notification listeners
 * @returns Cleanup function to remove listeners
 */
export function initializeNotificationListeners(): () => void {
  // Listener for when notification is received while app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('[NotificationService] Notification received:', notification);
  });

  // Listener for when user taps on notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('[NotificationService] Notification tapped:', response);
    const alarmId = response.notification.request.content.data?.alarmId;
    if (alarmId) {
      // Handle alarm notification tap (e.g., navigate to alarm screen)
      console.log('[NotificationService] Alarm triggered:', alarmId);
    }
  });

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
