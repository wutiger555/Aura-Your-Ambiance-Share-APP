/**
 * Hybrid Alarm Service
 *
 * Intelligent alarm scheduling that uses AlarmKit when available (iOS 26+),
 * falls back to expo-notifications on older iOS versions and Android
 *
 * Migration Strategy:
 * - Automatically uses AlarmKit for new alarms on iOS 26+
 * - Gradually migrates existing notification-based alarms
 * - Maintains backward compatibility
 *
 * @see /docs/ALARMKIT_INTEGRATION.md
 */

import { Platform } from 'react-native';
import { Alarm } from '@aura/shared';
import { AlarmKitService, AlarmAuthorizationStatus } from './alarmKitService';
import * as NotificationService from '../utils/notificationService';

// MARK: - Types

export interface ScheduleResult {
  success: boolean;
  alarmKitID?: string;       // If scheduled with AlarmKit
  notificationID?: string;   // If scheduled with expo-notifications
  method: 'alarmkit' | 'notification';
  error?: string;
}

export interface HybridAlarmOptions {
  alarm: Alarm;
  referenceTimezone: string;
  localTimezone: string;
  myLocationName?: string;
  partnerLocationName?: string;
  forceMethod?: 'alarmkit' | 'notification'; // For testing
}

// MARK: - Hybrid Alarm Service

export class HybridAlarmService {
  /**
   * Schedule an alarm using the best available method
   *
   * Priority:
   * 1. AlarmKit (iOS 26+, if authorized)
   * 2. expo-notifications (fallback)
   *
   * @param options - Scheduling options
   * @returns Schedule result with method used and IDs
   */
  static async scheduleAlarm(options: HybridAlarmOptions): Promise<ScheduleResult> {
    const { alarm, referenceTimezone, localTimezone, myLocationName, partnerLocationName, forceMethod } = options;

    console.log(`[HybridAlarmService] Scheduling alarm: ${alarm.label}`);

    // Check if AlarmKit should be used
    const shouldUseAlarmKit = forceMethod === 'alarmkit' ||
      (forceMethod !== 'notification' && AlarmKitService.isAvailable());

    if (shouldUseAlarmKit) {
      // Try AlarmKit first
      const alarmKitResult = await this.tryScheduleWithAlarmKit({
        alarm,
        referenceTimezone,
        localTimezone,
        myLocationName,
        partnerLocationName,
      });

      if (alarmKitResult.success) {
        return alarmKitResult;
      }

      console.log('[HybridAlarmService] AlarmKit failed, falling back to notifications');
    }

    // Fallback to expo-notifications
    return await this.scheduleWithNotifications({
      alarm,
      referenceTimezone,
      localTimezone,
    });
  }

  /**
   * Update an existing alarm
   *
   * @param alarm - Alarm with updated properties
   * @param referenceTimezone - Reference timezone
   * @param localTimezone - Local timezone
   * @returns Update result
   */
  static async updateAlarm(
    alarm: Alarm,
    referenceTimezone: string,
    localTimezone: string
  ): Promise<ScheduleResult> {
    console.log(`[HybridAlarmService] Updating alarm: ${alarm.id}`);

    // If alarm has AlarmKit ID, update via AlarmKit
    if (alarm.alarmKitID) {
      try {
        const success = await AlarmKitService.updateAlarm(alarm.alarmKitID, {
          alarm,
          referenceTimezone,
          localTimezone,
        });

        if (success) {
          return {
            success: true,
            alarmKitID: alarm.alarmKitID,
            method: 'alarmkit',
          };
        }
      } catch (error) {
        console.error('[HybridAlarmService] Failed to update AlarmKit alarm:', error);
        // Fall through to re-schedule
      }
    }

    // If alarm has notification ID, or AlarmKit update failed, reschedule
    if (alarm.notificationId) {
      await NotificationService.cancelAlarmNotification(alarm.notificationId);
    }

    // Reschedule with best method
    return await this.scheduleAlarm({
      alarm,
      referenceTimezone,
      localTimezone,
    });
  }

  /**
   * Cancel an alarm
   *
   * @param alarm - Alarm to cancel
   * @returns true if successfully canceled
   */
  static async cancelAlarm(alarm: Alarm): Promise<boolean> {
    console.log(`[HybridAlarmService] Canceling alarm: ${alarm.id}`);

    let alarmKitSuccess = true;
    let notificationSuccess = true;

    // Cancel AlarmKit alarm if exists
    if (alarm.alarmKitID) {
      try {
        alarmKitSuccess = await AlarmKitService.removeAlarm(alarm.alarmKitID);
      } catch (error) {
        console.error('[HybridAlarmService] Failed to cancel AlarmKit alarm:', error);
        alarmKitSuccess = false;
      }
    }

    // Cancel notification alarm if exists
    if (alarm.notificationId) {
      try {
        await NotificationService.cancelAlarmNotification(alarm.notificationId);
      } catch (error) {
        console.error('[HybridAlarmService] Failed to cancel notification alarm:', error);
        notificationSuccess = false;
      }
    }

    return alarmKitSuccess && notificationSuccess;
  }

  /**
   * Migrate an alarm from expo-notifications to AlarmKit
   *
   * @param alarm - Alarm to migrate
   * @param referenceTimezone - Reference timezone
   * @param localTimezone - Local timezone
   * @returns Migration result
   */
  static async migrateToAlarmKit(
    alarm: Alarm,
    referenceTimezone: string,
    localTimezone: string
  ): Promise<ScheduleResult> {
    console.log(`[HybridAlarmService] Migrating alarm to AlarmKit: ${alarm.id}`);

    if (!AlarmKitService.isAvailable()) {
      return {
        success: false,
        method: 'notification',
        error: 'AlarmKit not available on this device',
      };
    }

    if (!alarm.notificationId) {
      return {
        success: false,
        method: 'notification',
        error: 'Alarm is not using notifications',
      };
    }

    // Schedule with AlarmKit
    const alarmKitResult = await this.tryScheduleWithAlarmKit({
      alarm,
      referenceTimezone,
      localTimezone,
    });

    if (alarmKitResult.success) {
      // Cancel old notification
      await NotificationService.cancelAlarmNotification(alarm.notificationId);
      console.log(`[HybridAlarmService] Successfully migrated alarm ${alarm.id} to AlarmKit`);
    }

    return alarmKitResult;
  }

  // MARK: - Private Methods

  /**
   * Try scheduling with AlarmKit (with authorization flow)
   */
  private static async tryScheduleWithAlarmKit(options: {
    alarm: Alarm;
    referenceTimezone: string;
    localTimezone: string;
    myLocationName?: string;
    partnerLocationName?: string;
  }): Promise<ScheduleResult> {
    try {
      // Check authorization status
      const status = await AlarmKitService.getAuthorizationStatus();

      if (status === 'notDetermined') {
        // Request authorization
        console.log('[HybridAlarmService] Requesting AlarmKit authorization...');
        const granted = await AlarmKitService.requestAuthorization();

        if (!granted) {
          return {
            success: false,
            method: 'alarmkit',
            error: 'User denied AlarmKit authorization',
          };
        }
      } else if (status === 'denied') {
        return {
          success: false,
          method: 'alarmkit',
          error: 'AlarmKit authorization denied',
        };
      } else if (status === 'unavailable') {
        return {
          success: false,
          method: 'alarmkit',
          error: 'AlarmKit not available',
        };
      }

      // Schedule with AlarmKit
      const alarmKitID = await AlarmKitService.scheduleAlarm(options);

      return {
        success: true,
        alarmKitID,
        method: 'alarmkit',
      };
    } catch (error) {
      console.error('[HybridAlarmService] AlarmKit scheduling failed:', error);
      return {
        success: false,
        method: 'alarmkit',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule with expo-notifications (fallback)
   */
  private static async scheduleWithNotifications(options: {
    alarm: Alarm;
    referenceTimezone: string;
    localTimezone: string;
  }): Promise<ScheduleResult> {
    const { alarm, referenceTimezone, localTimezone } = options;

    try {
      const notificationID = await NotificationService.scheduleAlarmNotification(
        alarm,
        referenceTimezone,
        localTimezone
      );

      if (notificationID) {
        return {
          success: true,
          notificationID,
          method: 'notification',
        };
      } else {
        return {
          success: false,
          method: 'notification',
          error: 'Failed to schedule notification',
        };
      }
    } catch (error) {
      console.error('[HybridAlarmService] Notification scheduling failed:', error);
      return {
        success: false,
        method: 'notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get status information about alarm scheduling capabilities
   */
  static async getStatus(): Promise<{
    alarmKitAvailable: boolean;
    alarmKitAuthorized: boolean;
    notificationsAvailable: boolean;
    preferredMethod: 'alarmkit' | 'notification';
  }> {
    const alarmKitAvailable = AlarmKitService.isAvailable();
    let alarmKitAuthorized = false;

    if (alarmKitAvailable) {
      const status = await AlarmKitService.getAuthorizationStatus();
      alarmKitAuthorized = status === 'authorized';
    }

    const notificationsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

    return {
      alarmKitAvailable,
      alarmKitAuthorized,
      notificationsAvailable,
      preferredMethod: alarmKitAuthorized ? 'alarmkit' : 'notification',
    };
  }
}

export default HybridAlarmService;
