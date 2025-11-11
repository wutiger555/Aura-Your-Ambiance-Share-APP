/**
 * Expo Config Plugin for AlarmKit
 *
 * Automatically configures Info.plist with required NSAlarmKitUsageDescription
 * for iOS 26+ AlarmKit framework integration
 *
 * Usage in app.json:
 * {
 *   "expo": {
 *     "plugins": ["./plugins/withAlarmKit"]
 *   }
 * }
 */

const { withInfoPlist } = require('@expo/config-plugins');

const ALARMKIT_USAGE_DESCRIPTION =
  'Aura schedules alarms to help you connect with your partner across timezones at the perfect moment. ' +
  'These alarms will work even when your device is in Silent Mode or Do Not Disturb.';

/**
 * Config plugin to add AlarmKit permissions
 * @param {import('@expo/config-plugins').ExportedConfig} config - Expo config
 * @returns {import('@expo/config-plugins').ExportedConfig} Modified config
 */
const withAlarmKit = (config) => {
  return withInfoPlist(config, (config) => {
    // Add NSAlarmKitUsageDescription if not already present
    if (!config.modResults.NSAlarmKitUsageDescription) {
      config.modResults.NSAlarmKitUsageDescription = ALARMKIT_USAGE_DESCRIPTION;
      console.log('✅ Added NSAlarmKitUsageDescription to Info.plist');
    }

    return config;
  });
};

module.exports = withAlarmKit;
