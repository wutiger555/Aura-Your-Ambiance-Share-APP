/**
 * AlarmKit Service
 *
 * TypeScript wrapper for native AlarmKit functionality (iOS 26+)
 * Provides system-level alarm capabilities that bypass Silent Mode and Do Not Disturb
 *
 * Features:
 * - Full-screen Lock Screen alarm display
 * - Dynamic Island integration
 * - Live Activities for countdown timers
 * - Apple Watch synchronization
 *
 * @see /docs/ALARMKIT_INTEGRATION.md
 */

import { NativeModules, Platform } from 'react-native';
import { Alarm } from '@aura/shared';

const { AuraAlarmKitModule } = NativeModules;

// MARK: - Types

export type AlarmAuthorizationStatus = 'notDetermined' | 'authorized' | 'denied' | 'unavailable';

export interface AlarmKitCapabilities {
  isAvailable: boolean;
  authorizationStatus: AlarmAuthorizationStatus;
  supportsLiveActivities: boolean;
  supportsDynamicIsland: boolean;
}

export interface ScheduleAlarmParams {
  alarm: Alarm;
  referenceTimezone: string; // IANA timezone (e.g., "America/New_York")
  localTimezone: string;     // IANA timezone of device
  myLocationName?: string;   // For Live Activity display
  partnerLocationName?: string;
}

// MARK: - AlarmKit Service

export class AlarmKitService {
  /**
   * Check if AlarmKit is available on this device
   * Requires iOS 26.0+
   */
  static isAvailable(): boolean {
    if (Platform.OS !== 'ios') {
      return false;
    }

    if (!AuraAlarmKitModule) {
      return false;
    }

    // Check iOS version
    const iosVersion = parseFloat(Platform.Version as string);
    return iosVersion >= 26.0;
  }

  /**
   * Get current authorization status
   * @returns Authorization status or 'unavailable' if AlarmKit not supported
   */
  static async getAuthorizationStatus(): Promise<AlarmAuthorizationStatus> {
    if (!this.isAvailable()) {
      return 'unavailable';
    }

    try {
      const status = await AuraAlarmKitModule.getAuthorizationStatus();
      return status as AlarmAuthorizationStatus;
    } catch (error) {
      console.error('[AlarmKitService] Failed to get authorization status:', error);
      return 'unavailable';
    }
  }

  /**
   * Request alarm authorization from user
   * Shows system dialog explaining alarm permissions
   *
   * @returns true if user granted permission, false otherwise
   */
  static async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[AlarmKitService] AlarmKit not available, cannot request authorization');
      return false;
    }

    try {
      const granted = await AuraAlarmKitModule.requestAuthorization();
      console.log('[AlarmKitService] Authorization result:', granted);
      return granted;
    } catch (error) {
      console.error('[AlarmKitService] Failed to request authorization:', error);
      return false;
    }
  }

  /**
   * Schedule an alarm using AlarmKit
   *
   * @param params - Alarm scheduling parameters
   * @returns AlarmKit alarm ID (UUID string)
   * @throws Error if scheduling fails or AlarmKit not available
   */
  static async scheduleAlarm(params: ScheduleAlarmParams): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('AlarmKit is not available on this device');
    }

    const { alarm, referenceTimezone, localTimezone, myLocationName, partnerLocationName } = params;

    const alarmData = {
      id: alarm.id,
      label: alarm.label,
      hour: alarm.hour,
      minute: alarm.minute,
      referenceTimezone,
      localTimezone,
      repeatDays: alarm.repeatDays,
      sound: alarm.sound,
      vibrate: alarm.vibrate,
      // Optional metadata for Live Activity
      myLocationName: myLocationName || '',
      partnerLocationName: partnerLocationName || '',
    };

    try {
      const alarmKitID = await AuraAlarmKitModule.scheduleAlarm(alarmData);
      console.log('[AlarmKitService] Alarm scheduled:', alarmKitID);
      return alarmKitID;
    } catch (error) {
      console.error('[AlarmKitService] Failed to schedule alarm:', error);
      throw error;
    }
  }

  /**
   * Update an existing alarm
   *
   * @param alarmKitID - AlarmKit alarm ID (UUID string)
   * @param params - Updated alarm parameters
   * @returns true if update successful
   */
  static async updateAlarm(alarmKitID: string, params: ScheduleAlarmParams): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('AlarmKit is not available on this device');
    }

    const { alarm, referenceTimezone, localTimezone, myLocationName, partnerLocationName } = params;

    const alarmData = {
      id: alarm.id,
      label: alarm.label,
      hour: alarm.hour,
      minute: alarm.minute,
      referenceTimezone,
      localTimezone,
      repeatDays: alarm.repeatDays,
      sound: alarm.sound,
      vibrate: alarm.vibrate,
      myLocationName: myLocationName || '',
      partnerLocationName: partnerLocationName || '',
    };

    try {
      const success = await AuraAlarmKitModule.updateAlarm(alarmKitID, alarmData);
      console.log('[AlarmKitService] Alarm updated:', alarmKitID);
      return success;
    } catch (error) {
      console.error('[AlarmKitService] Failed to update alarm:', error);
      throw error;
    }
  }

  /**
   * Remove a scheduled alarm
   *
   * @param alarmKitID - AlarmKit alarm ID (UUID string)
   * @returns true if removal successful
   */
  static async removeAlarm(alarmKitID: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[AlarmKitService] AlarmKit not available, cannot remove alarm');
      return false;
    }

    try {
      const success = await AuraAlarmKitModule.removeAlarm(alarmKitID);
      console.log('[AlarmKitService] Alarm removed:', alarmKitID);
      return success;
    } catch (error) {
      console.error('[AlarmKitService] Failed to remove alarm:', error);
      return false;
    }
  }

  /**
   * Get all scheduled alarms from AlarmKit
   * Useful for debugging or syncing state
   *
   * @returns Array of alarm info from AlarmKit
   */
  static async getAllAlarms(): Promise<Array<{ id: string; label: string; isEnabled: boolean }>> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const alarms = await AuraAlarmKitModule.getAllAlarms();
      return alarms;
    } catch (error) {
      console.error('[AlarmKitService] Failed to get all alarms:', error);
      return [];
    }
  }

  /**
   * Get full capability information for this device
   *
   * @returns AlarmKit capabilities object
   */
  static async getCapabilities(): Promise<AlarmKitCapabilities> {
    const isAvailable = this.isAvailable();

    if (!isAvailable) {
      return {
        isAvailable: false,
        authorizationStatus: 'unavailable',
        supportsLiveActivities: false,
        supportsDynamicIsland: false,
      };
    }

    const authorizationStatus = await this.getAuthorizationStatus();

    // Check for Dynamic Island support (iPhone 14 Pro and newer)
    // Note: This is a simplified check; in production, use device model detection
    const supportsDynamicIsland = Platform.OS === 'ios' && parseFloat(Platform.Version as string) >= 26.0;

    return {
      isAvailable: true,
      authorizationStatus,
      supportsLiveActivities: true, // iOS 26+ always supports Live Activities
      supportsDynamicIsland,
    };
  }
}

// MARK: - Exports

export default AlarmKitService;
