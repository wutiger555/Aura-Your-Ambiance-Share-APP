/**
 * AlarmKitMigrationBanner
 *
 * Shows a dismissible banner when AlarmKit is available and user has
 * notification-based alarms that can be upgraded to system-level alarms
 *
 * Design: Follows Aura v2.7.0 minimalist aesthetic with subtle animations
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, X, Sparkles } from 'lucide-react-native';
import { useAlarmStore } from '../../stores/useAlarmStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useWeatherStore } from '../../stores/useWeatherStore';
import { HybridAlarmService } from '../../services/hybridAlarmService';

const AlarmKitMigrationBanner: React.FC = () => {
  const { alarms, alarmKitCapabilities, updateAlarm, getAlarmsUsingNotifications } = useAlarmStore();
  const { myLocation, partnerLocation } = useLocationStore();
  const { myWeather, partnerWeather } = useWeatherStore();

  const [dismissed, setDismissed] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Get alarms that can be migrated (using notifications only)
  const migratableAlarms = getAlarmsUsingNotifications();

  // Show banner if:
  // 1. AlarmKit is available
  // 2. User has alarms using notifications
  // 3. User hasn't dismissed banner
  // 4. Locations are set (needed for migration)
  const shouldShow =
    !dismissed &&
    alarmKitCapabilities?.isAvailable &&
    alarmKitCapabilities.authorizationStatus === 'authorized' &&
    migratableAlarms.length > 0 &&
    myLocation &&
    partnerLocation &&
    myWeather &&
    partnerWeather;

  if (!shouldShow) {
    return null;
  }

  const handleMigrateAll = async () => {
    if (!myWeather || !partnerWeather) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    Alert.alert(
      '🎉 Upgrade to System Alarms',
      `Upgrade ${migratableAlarms.length} alarm${migratableAlarms.length > 1 ? 's' : ''} to use AlarmKit?\n\n` +
        '✓ Works in Silent Mode\n' +
        '✓ Works with Do Not Disturb\n' +
        '✓ Full-screen display\n' +
        '✓ Dynamic Island support',
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Upgrade',
          onPress: async () => {
            setIsMigrating(true);

            let successCount = 0;
            let failCount = 0;

            for (const alarm of migratableAlarms) {
              try {
                const referenceTimezone =
                  alarm.timeZoneReference === 'my' ? myWeather.timezone : partnerWeather.timezone;
                const localTimezone = myWeather.timezone;

                const result = await HybridAlarmService.migrateToAlarmKit(
                  alarm,
                  referenceTimezone,
                  localTimezone
                );

                if (result.success && result.alarmKitID) {
                  // Update alarm with new AlarmKit ID
                  updateAlarm(alarm.id, {
                    alarmKitID: result.alarmKitID,
                    notificationId: undefined, // Clear old notification ID
                  });
                  successCount++;
                } else {
                  failCount++;
                  console.error('[AlarmKitMigrationBanner] Failed to migrate alarm:', alarm.id, result.error);
                }
              } catch (error) {
                failCount++;
                console.error('[AlarmKitMigrationBanner] Error migrating alarm:', error);
              }
            }

            setIsMigrating(false);
            setDismissed(true);

            if (successCount > 0) {
              Alert.alert(
                '✅ Migration Complete',
                `Successfully upgraded ${successCount} alarm${successCount > 1 ? 's' : ''} to system-level alarms!` +
                  (failCount > 0 ? `\n\n${failCount} alarm${failCount > 1 ? 's' : ''} could not be upgraded.` : '')
              );
            } else {
              Alert.alert('Migration Failed', 'Could not upgrade alarms. Please try again later.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.15)', 'rgba(147, 51, 234, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDismissed(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Bell size={24} color="#06b6d4" strokeWidth={2.5} />
                <View style={styles.sparkleIcon}>
                  <Sparkles size={14} color="#fbbf24" fill="#fbbf24" />
                </View>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>System-Level Alarms Available</Text>
              <Text style={styles.message}>
                Upgrade {migratableAlarms.length} alarm{migratableAlarms.length > 1 ? 's' : ''} to bypass Silent Mode
                and Do Not Disturb
              </Text>
            </View>

            {/* Upgrade button */}
            <TouchableOpacity
              style={[styles.upgradeButton, isMigrating && styles.upgradeButtonDisabled]}
              onPress={handleMigrateAll}
              disabled={isMigrating}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#06b6d4', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>
                  {isMigrating ? 'Upgrading...' : 'Upgrade Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // Below top AuraGlobe
    left: 20,
    right: 20,
    zIndex: 90,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    // Shadow
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(10, 1, 24, 0.9)',
    borderRadius: 10,
    padding: 2,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  upgradeButton: {
    flexShrink: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeButtonDisabled: {
    opacity: 0.5,
  },
  upgradeButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default AlarmKitMigrationBanner;
