# AlarmKit Integration Design Document

## Executive Summary

This document outlines the integration of iOS 26's **AlarmKit framework** into Aura's multi-timezone alarm system. AlarmKit replaces the current `expo-notifications` approach with **system-level alarm capabilities**, including:

- ✅ **Penetrates Do Not Disturb** and Silent Mode
- ✅ **Full-screen Lock Screen display**
- ✅ **Dynamic Island integration**
- ✅ **Live Activities** for countdown timers
- ✅ **Apple Watch synchronization**

This addresses the critical limitation documented in `ALARM_FEATURES.md` where third-party apps could not bypass system restrictions.

---

## Current State Analysis

### Existing Implementation (v2.7.0)

**Technology Stack:**
- `expo-notifications` - Local notification scheduling
- Manual timezone conversion (`date-fns-tz`)
- Zustand store with AsyncStorage persistence
- Custom UI components (AlarmCard, AlarmCountdown, etc.)

**Key Limitations:**
- ❌ Cannot override Silent Mode or Do Not Disturb
- ❌ No full-screen alarm display on Lock Screen
- ❌ Limited to notification sounds (not true alarm behavior)
- ❌ No system-level integration (Dynamic Island, Apple Watch)

**Strengths to Preserve:**
- ✅ Multi-timezone conversion logic (unique value proposition)
- ✅ Dual-timezone display (reference vs. local time)
- ✅ Aura's minimalist design language
- ✅ Integration with couple connection features

---

## AlarmKit Framework Overview

### Core Components

#### 1. **AlarmManager** (Singleton)
```swift
AlarmManager.shared
├── authorizationState: AlarmAuthorizationStatus
│   ├── .notDetermined
│   ├── .authorized
│   └── .denied
├── requestAuthorization() async -> Bool
├── scheduleAlarm(configuration: AlarmConfiguration) async throws -> AlarmID
├── updateAlarm(id: AlarmID, configuration: AlarmConfiguration) async throws
├── removeAlarm(id: AlarmID) async throws
└── getAllAlarms() async -> [Alarm]
```

#### 2. **AlarmConfiguration**
```swift
AlarmConfiguration
├── Schedule-Based Alarms
│   ├── dateComponents: DateComponents (time of day)
│   ├── repeats: [Weekday] (optional)
│   └── timezone: TimeZone
└── Countdown-Based Alarms (Timers)
    ├── duration: TimeInterval
    └── requiresLiveActivity: Bool
```

#### 3. **AlarmPresentation**
```swift
AlarmPresentation
├── alertState: AlertConfiguration
│   ├── title: String
│   ├── message: String
│   └── actions: [AlarmAction]
├── countdownState: CountdownConfiguration (for timers)
└── soundConfiguration: AlarmSound
```

#### 4. **Live Activities** (Required for Countdown Alarms)
```swift
// Widget Extension
struct AlarmCountdownAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var remainingTime: TimeInterval
        var isPaused: Bool
    }
    var alarmLabel: String
    var targetTime: Date
}
```

### Authorization Flow

1. **Info.plist Configuration**
   ```xml
   <key>NSAlarmKitUsageDescription</key>
   <string>Aura schedules alarms to help you connect with your partner across timezones at the perfect moment.</string>
   ```

2. **Runtime Authorization**
   - First alarm creation triggers automatic prompt
   - OR manual call to `requestAuthorization()`
   - User sees system dialog explaining alarm permissions

3. **Authorization States**
   - `notDetermined` → Show onboarding, request permission
   - `authorized` → Proceed with alarm scheduling
   - `denied` → Show fallback UI with guidance to enable in Settings

---

## Integration Architecture

### Layer 1: Native Module Bridge (Swift)

**File:** `apps/mobile/ios/Modules/AuraAlarmKitModule.swift`

```swift
@objc(AuraAlarmKitModule)
class AuraAlarmKitModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // MARK: - Authorization

    @objc
    func getAuthorizationStatus(_ resolver: @escaping RCTPromiseResolveBlock,
                                rejecter: @escaping RCTPromiseRejectBlock) {
        let status = AlarmManager.shared.authorizationState
        resolver(statusToString(status))
    }

    @objc
    func requestAuthorization(_ resolver: @escaping RCTPromiseResolveBlock,
                             rejecter: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                let granted = try await AlarmManager.shared.requestAuthorization()
                resolver(granted)
            } catch {
                rejecter("AUTH_ERROR", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Scheduling

    @objc
    func scheduleAlarm(_ alarmData: NSDictionary,
                      resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                let configuration = try buildAlarmConfiguration(from: alarmData)
                let alarmID = try await AlarmManager.shared.scheduleAlarm(configuration: configuration)
                resolver(alarmID.uuidString)
            } catch {
                rejecter("SCHEDULE_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc
    func removeAlarm(_ alarmID: String,
                    resolver: @escaping RCTPromiseResolveBlock,
                    rejecter: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                guard let uuid = UUID(uuidString: alarmID) else {
                    throw NSError(domain: "AuraAlarmKit", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid alarm ID"])
                }
                try await AlarmManager.shared.removeAlarm(id: AlarmID(uuid))
                resolver(true)
            } catch {
                rejecter("REMOVE_ERROR", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Helpers

    private func buildAlarmConfiguration(from data: NSDictionary) throws -> AlarmConfiguration {
        // Parse JS data into AlarmConfiguration
        // Handle timezone conversion
        // Build AlarmPresentation with Aura branding
    }
}
```

**Bridge Header:** `apps/mobile/ios/Modules/AuraAlarmKitModule.m`

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AuraAlarmKitModule, NSObject)

RCT_EXTERN_METHOD(getAuthorizationStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(scheduleAlarm:(NSDictionary *)alarmData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeAlarm:(NSString *)alarmID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

### Layer 2: TypeScript Service Layer

**File:** `apps/mobile/src/services/alarmKitService.ts`

```typescript
import { NativeModules, Platform } from 'react-native';
import { Alarm } from '@aura/shared';

const { AuraAlarmKitModule } = NativeModules;

export type AlarmAuthorizationStatus = 'notDetermined' | 'authorized' | 'denied';

export class AlarmKitService {
  /**
   * Check if AlarmKit is available on this device
   */
  static isAvailable(): boolean {
    return Platform.OS === 'ios' && Platform.Version >= '26.0' && AuraAlarmKitModule != null;
  }

  /**
   * Get current authorization status
   */
  static async getAuthorizationStatus(): Promise<AlarmAuthorizationStatus> {
    if (!this.isAvailable()) {
      throw new Error('AlarmKit is not available on this device');
    }
    return await AuraAlarmKitModule.getAuthorizationStatus();
  }

  /**
   * Request alarm authorization from user
   */
  static async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    return await AuraAlarmKitModule.requestAuthorization();
  }

  /**
   * Schedule an alarm using AlarmKit
   * @param alarm - Alarm object with timezone reference
   * @param referenceTimezone - IANA timezone of reference location
   * @param localTimezone - IANA timezone of device
   * @returns AlarmKit alarm ID
   */
  static async scheduleAlarm(
    alarm: Alarm,
    referenceTimezone: string,
    localTimezone: string
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('AlarmKit is not available');
    }

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
    };

    return await AuraAlarmKitModule.scheduleAlarm(alarmData);
  }

  /**
   * Remove a scheduled alarm
   */
  static async removeAlarm(alarmKitID: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    return await AuraAlarmKitModule.removeAlarm(alarmKitID);
  }
}
```

### Layer 3: Expo Config Plugin

**File:** `apps/mobile/plugins/withAlarmKit.js`

```javascript
const { withInfoPlist } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add AlarmKit permissions to Info.plist
 */
const withAlarmKit = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSAlarmKitUsageDescription =
      config.modResults.NSAlarmKitUsageDescription ||
      'Aura schedules alarms to help you connect with your partner across timezones at the perfect moment.';

    return config;
  });
};

module.exports = withAlarmKit;
```

**Update:** `apps/mobile/app.json`

```json
{
  "expo": {
    "plugins": [
      "./plugins/withAlarmKit"
    ]
  }
}
```

### Layer 4: Updated Service with Hybrid Approach

**File:** `apps/mobile/src/services/hybridAlarmService.ts`

```typescript
import { AlarmKitService } from './alarmKitService';
import * as NotificationService from '../utils/notificationService';
import { Alarm } from '@aura/shared';

/**
 * Hybrid alarm service that uses AlarmKit when available,
 * falls back to expo-notifications on older iOS or Android
 */
export class HybridAlarmService {
  /**
   * Schedule an alarm using best available method
   */
  static async scheduleAlarm(
    alarm: Alarm,
    referenceTimezone: string,
    localTimezone: string
  ): Promise<{ alarmKitID?: string; notificationID?: string }> {
    // Try AlarmKit first (iOS 26+)
    if (AlarmKitService.isAvailable()) {
      const status = await AlarmKitService.getAuthorizationStatus();

      if (status === 'notDetermined') {
        const granted = await AlarmKitService.requestAuthorization();
        if (!granted) {
          // User denied, fall back to notifications
          return this.scheduleWithNotifications(alarm, referenceTimezone, localTimezone);
        }
      }

      if (status === 'authorized') {
        const alarmKitID = await AlarmKitService.scheduleAlarm(
          alarm,
          referenceTimezone,
          localTimezone
        );
        return { alarmKitID };
      }
    }

    // Fallback to expo-notifications
    return this.scheduleWithNotifications(alarm, referenceTimezone, localTimezone);
  }

  private static async scheduleWithNotifications(
    alarm: Alarm,
    referenceTimezone: string,
    localTimezone: string
  ): Promise<{ notificationID?: string }> {
    const notificationID = await NotificationService.scheduleAlarmNotification(
      alarm,
      referenceTimezone,
      localTimezone
    );
    return { notificationID };
  }

  /**
   * Cancel an alarm
   */
  static async cancelAlarm(alarm: Alarm): Promise<void> {
    if (alarm.alarmKitID) {
      await AlarmKitService.removeAlarm(alarm.alarmKitID);
    }
    if (alarm.notificationId) {
      await NotificationService.cancelAlarmNotification(alarm.notificationId);
    }
  }
}
```

---

## Live Activities Design (Countdown Timers)

### Widget Extension Target

**File:** `apps/mobile/ios/AlarmCountdownWidget/AlarmCountdownWidget.swift`

```swift
import WidgetKit
import SwiftUI
import ActivityKit

// MARK: - Activity Attributes

struct AlarmCountdownAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var remainingSeconds: Int
        var isPaused: Bool
        var partnerLocationName: String
    }

    var alarmLabel: String
    var targetTime: Date
    var myLocationName: String
}

// MARK: - Live Activity Views

struct AlarmCountdownLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: AlarmCountdownAttributes.self) { context in
            // Lock Screen / Banner UI
            LockScreenCountdownView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded
                DynamicIslandExpandedRegion(.leading) {
                    AuraLogoView(size: 40)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    CountdownTimerView(
                        remainingSeconds: context.state.remainingSeconds
                    )
                }
                DynamicIslandExpandedRegion(.bottom) {
                    AlarmLabelView(label: context.attributes.alarmLabel)
                    LocationsView(
                        myLocation: context.attributes.myLocationName,
                        partnerLocation: context.state.partnerLocationName
                    )
                }
            } compactLeading: {
                // Compact Leading (bell icon)
                Image(systemName: "bell.fill")
                    .foregroundColor(.cyan)
            } compactTrailing: {
                // Compact Trailing (countdown)
                Text(formatCompactTime(context.state.remainingSeconds))
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            } minimal: {
                // Minimal (just icon)
                Image(systemName: "bell.fill")
                    .foregroundColor(.cyan)
            }
        }
    }
}

// MARK: - Lock Screen View (Aura Design)

struct LockScreenCountdownView: View {
    let context: ActivityViewContext<AlarmCountdownAttributes>

    var body: some View {
        VStack(spacing: 12) {
            // Top: Alarm Label with Aura branding
            HStack(spacing: 8) {
                AuraLogoView(size: 24)
                Text(context.attributes.alarmLabel)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
            }

            // Middle: Countdown Timer (Large)
            Text(formatTime(context.state.remainingSeconds))
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(Color(red: 0.024, green: 0.714, blue: 0.835)) // Aura cyan
                .monospacedDigit()

            // Bottom: Location Names (Connection Context)
            HStack(spacing: 4) {
                Text(context.attributes.myLocationName)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.cyan)
                Text("✦")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.5))
                Text(context.state.partnerLocationName)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Color(red: 0.914, green: 0.2, blue: 0.667)) // Aura pink
            }

            // Pause/Resume Button (if paused)
            if context.state.isPaused {
                Button(intent: ResumeAlarmIntent(alarmID: context.attributes.alarmLabel)) {
                    HStack {
                        Image(systemName: "play.fill")
                        Text("Resume")
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.cyan.opacity(0.3))
                    .cornerRadius(20)
                }
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.039, green: 0.004, blue: 0.094), // #0a0118
                    Color(red: 0.192, green: 0.180, blue: 0.506)  // #312e81
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
    }

    private func formatTime(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        let secs = seconds % 60

        if hours > 0 {
            return String(format: "%02d:%02d:%02d", hours, minutes, secs)
        } else {
            return String(format: "%02d:%02d", minutes, secs)
        }
    }
}

// MARK: - Aura Logo Component

struct AuraLogoView: View {
    let size: CGFloat

    var body: some View {
        // SVG path data from AuraLogo.tsx converted to SwiftUI
        // Simplified version for widget
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [.cyan, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
                .opacity(0.3)

            Image(systemName: "heart.fill")
                .resizable()
                .foregroundColor(.white)
                .frame(width: size * 0.5, height: size * 0.5)
        }
    }
}
```

### Widget Target Configuration

**File:** `apps/mobile/ios/Podfile`

```ruby
# Add Widget Extension target
target 'AlarmCountdownWidget' do
  inherit! :search_paths
end
```

**File:** `apps/mobile/ios/AlarmCountdownWidget/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
    </dict>
    <key>CFBundleDisplayName</key>
    <string>Aura Alarms</string>
    <key>MinimumOSVersion</key>
    <string>26.0</string>
</dict>
</plist>
```

---

## Lock Screen Alarm Interface

### Full-Screen Alarm Presentation

When alarm triggers, AlarmKit displays a **full-screen interface** (like native Clock app). We customize this via `AlarmPresentation`:

```swift
// In AuraAlarmKitModule.swift

private func buildAlarmPresentation(label: String, locations: (my: String, partner: String)) -> AlarmPresentation {
    var presentation = AlarmPresentation()

    // Alert State (when alarm fires)
    presentation.alertState = AlertConfiguration(
        title: "🔔 " + label,
        message: "\(locations.my) ✦ \(locations.partner)",
        actions: [
            AlarmAction(title: "Stop", style: .default, handler: { _ in
                // Dismiss alarm
            }),
            AlarmAction(title: "Snooze 5 min", style: .cancel, handler: { _ in
                // Snooze for 5 minutes
            })
        ]
    )

    // Sound Configuration
    presentation.soundConfiguration = AlarmSound.system(.alarm) // or custom sound

    // Visual Customization (iOS 26.1+)
    presentation.backgroundColor = UIColor(red: 0.039, green: 0.004, blue: 0.094, alpha: 1.0) // Aura dark
    presentation.accentColor = UIColor(red: 0.024, green: 0.714, blue: 0.835, alpha: 1.0) // Aura cyan

    return presentation
}
```

**Note:** Full UI customization is limited. iOS 26 allows:
- ✅ Title and message text
- ✅ Background and accent colors
- ✅ Custom alarm sounds
- ❌ Complete custom UI (uses system template)

---

## Updated Type Definitions

**File:** `packages/shared/types/index.ts`

```typescript
export interface Alarm {
  id: string;
  label: string;
  timeZoneReference: 'my' | 'partner';
  hour: number; // 0-23 in reference timezone
  minute: number; // 0-59
  enabled: boolean;
  repeatDays: number[]; // 0-6 (0=Sunday)
  sound: string;
  vibrate: boolean;
  createdAt: string;

  // AlarmKit integration (iOS 26+)
  alarmKitID?: string; // AlarmKit alarm ID (UUID string)

  // Legacy fallback (iOS < 26, Android)
  notificationId?: string; // expo-notifications ID
}

export interface AlarmKitCapabilities {
  isAvailable: boolean; // iOS 26+ only
  authorizationStatus: 'notDetermined' | 'authorized' | 'denied' | 'unavailable';
  supportsLiveActivities: boolean;
  supportsDynamicIsland: boolean;
}
```

**File:** `apps/mobile/src/stores/useAlarmStore.ts`

```typescript
// Add AlarmKit capabilities to store
interface AlarmStore {
  alarms: Alarm[];
  alarmKitCapabilities: AlarmKitCapabilities | null;

  // Existing methods...
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;

  // New methods
  setAlarmKitCapabilities: (capabilities: AlarmKitCapabilities) => void;
  migrateToAlarmKit: (alarmId: string) => Promise<void>;
}
```

---

## Migration Strategy

### Phase 1: Capability Detection (On App Launch)

```typescript
// In App.tsx or AlarmManager component

useEffect(() => {
  async function initializeAlarmKit() {
    if (AlarmKitService.isAvailable()) {
      const status = await AlarmKitService.getAuthorizationStatus();

      useAlarmStore.getState().setAlarmKitCapabilities({
        isAvailable: true,
        authorizationStatus: status,
        supportsLiveActivities: true, // iOS 26+ always supports
        supportsDynamicIsland: DeviceInfo.hasDynamicIsland(), // device-specific
      });
    } else {
      useAlarmStore.getState().setAlarmKitCapabilities({
        isAvailable: false,
        authorizationStatus: 'unavailable',
        supportsLiveActivities: false,
        supportsDynamicIsland: false,
      });
    }
  }

  initializeAlarmKit();
}, []);
```

### Phase 2: Gradual Migration of Existing Alarms

```typescript
/**
 * Migrate alarm from expo-notifications to AlarmKit
 * Called when user edits/enables an existing alarm
 */
async function migrateAlarmToAlarmKit(alarm: Alarm) {
  const { myWeather, partnerWeather } = useLocationStore.getState();
  const { alarmKitCapabilities } = useAlarmStore.getState();

  if (!alarmKitCapabilities?.isAvailable || alarmKitCapabilities.authorizationStatus !== 'authorized') {
    return; // Keep using notifications
  }

  const referenceTimezone = alarm.timeZoneReference === 'my' ? myWeather.timezone : partnerWeather.timezone;
  const localTimezone = myWeather.timezone;

  try {
    // 1. Schedule with AlarmKit
    const alarmKitID = await AlarmKitService.scheduleAlarm(alarm, referenceTimezone, localTimezone);

    // 2. Cancel old notification
    if (alarm.notificationId) {
      await NotificationService.cancelAlarmNotification(alarm.notificationId);
    }

    // 3. Update alarm record
    useAlarmStore.getState().updateAlarm(alarm.id, {
      alarmKitID,
      notificationId: undefined, // Clear old ID
    });

    console.log(`[Migration] Alarm ${alarm.id} migrated to AlarmKit`);
  } catch (error) {
    console.error('[Migration] Failed to migrate alarm:', error);
    // Keep using notifications as fallback
  }
}
```

### Phase 3: User Notification

**Component:** `AlarmKitMigrationBanner.tsx`

```typescript
/**
 * Shows when AlarmKit is available and user has notification-based alarms
 */
const AlarmKitMigrationBanner: React.FC = () => {
  const { alarms, alarmKitCapabilities } = useAlarmStore();
  const [dismissed, setDismissed] = useState(false);

  // Show if:
  // 1. AlarmKit is available
  // 2. User has alarms using old notifications
  // 3. User hasn't dismissed banner
  const shouldShow =
    !dismissed &&
    alarmKitCapabilities?.isAvailable &&
    alarms.some(a => !a.alarmKitID && a.notificationId);

  if (!shouldShow) return null;

  return (
    <BlurView style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 New: System-Level Alarms</Text>
        <Text style={styles.message}>
          Your alarms can now bypass Silent Mode and Do Not Disturb!
          Tap to upgrade your existing alarms.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            // Migrate all alarms
            for (const alarm of alarms) {
              if (!alarm.alarmKitID) {
                await migrateAlarmToAlarmKit(alarm);
              }
            }
            setDismissed(true);
          }}
        >
          <Text style={styles.buttonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};
```

---

## UI Component Updates

### 1. AlarmCard Enhancement

Show AlarmKit status badge:

```typescript
// In AlarmCard.tsx

const AlarmCard: React.FC<AlarmCardProps> = ({ alarm }) => {
  // ... existing code ...

  return (
    <View style={styles.card}>
      {/* Existing alarm info */}

      {/* AlarmKit Badge */}
      {alarm.alarmKitID && (
        <View style={styles.alarmKitBadge}>
          <Bell size={12} color="#06b6d4" />
          <Text style={styles.badgeText}>System Alarm</Text>
        </View>
      )}
    </View>
  );
};
```

### 2. AlarmEditModal Enhancement

Request AlarmKit permission when creating alarm:

```typescript
// In AlarmEditModal.tsx

const handleSave = async () => {
  const { alarmKitCapabilities } = useAlarmStore.getState();

  // Request AlarmKit permission if available and not authorized
  if (
    alarmKitCapabilities?.isAvailable &&
    alarmKitCapabilities.authorizationStatus === 'notDetermined'
  ) {
    Alert.alert(
      '🔔 Enable System Alarms?',
      'Aura can now create alarms that work even in Silent Mode and Do Not Disturb. This requires alarm permissions.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const granted = await AlarmKitService.requestAuthorization();
            if (granted) {
              await scheduleWithAlarmKit();
            } else {
              await scheduleWithNotifications();
            }
          },
        },
      ]
    );
  } else {
    await scheduleWithBestMethod();
  }
};
```

### 3. Settings Screen Enhancement

Add AlarmKit status section:

```typescript
// In Settings.tsx

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Alarm System</Text>
  {alarmKitCapabilities?.isAvailable ? (
    <View>
      <Text style={styles.label}>System-Level Alarms</Text>
      <Text style={styles.value}>
        {alarmKitCapabilities.authorizationStatus === 'authorized'
          ? '✅ Enabled (bypasses Silent Mode)'
          : '⚠️ Not authorized'}
      </Text>
      {alarmKitCapabilities.authorizationStatus !== 'authorized' && (
        <TouchableOpacity onPress={openSettings}>
          <Text style={styles.link}>Open Settings to Enable</Text>
        </TouchableOpacity>
      )}
    </View>
  ) : (
    <View>
      <Text style={styles.label}>Notification-Based Alarms</Text>
      <Text style={styles.value}>
        ℹ️ Limited by system restrictions (requires iOS 26+)
      </Text>
    </View>
  )}
</View>
```

---

## Testing Strategy

### Unit Tests

1. **AlarmKit Service Tests**
   - Authorization flow
   - Alarm scheduling with timezone conversion
   - Error handling for denied permissions

2. **Hybrid Service Tests**
   - Fallback logic
   - Migration scenarios
   - Capability detection

### Integration Tests

1. **Native Module Bridge**
   - Swift → JavaScript data passing
   - Async error handling
   - Timezone conversion accuracy

2. **Live Activity**
   - Countdown timer accuracy
   - Pause/resume state
   - Dynamic Island display

### Manual Testing Checklist

- [ ] iOS 26 device: AlarmKit alarm triggers in Silent Mode
- [ ] iOS 26 device: Full-screen alarm display on Lock Screen
- [ ] iOS 26 device: Dynamic Island shows countdown
- [ ] iOS 26 device: Apple Watch receives alarm
- [ ] iOS 25 device: Falls back to expo-notifications gracefully
- [ ] Android device: Uses expo-notifications
- [ ] Multi-timezone alarm conversion accuracy
- [ ] DST boundary handling
- [ ] Migration from old alarms to AlarmKit

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create Native Module bridge (`AuraAlarmKitModule.swift`)
- [ ] Create bridge header (`AuraAlarmKitModule.m`)
- [ ] Create TypeScript service (`alarmKitService.ts`)
- [ ] Create Expo Config Plugin (`withAlarmKit.js`)
- [ ] Update type definitions (`Alarm` interface)

### Phase 2: Core Functionality (Week 2)
- [ ] Implement authorization flow
- [ ] Implement alarm scheduling
- [ ] Implement alarm cancellation
- [ ] Create hybrid service with fallback logic
- [ ] Update `useAlarmStore` for AlarmKit support

### Phase 3: Live Activities (Week 3)
- [ ] Create Widget Extension target
- [ ] Implement `AlarmCountdownAttributes`
- [ ] Design Lock Screen countdown view (Aura style)
- [ ] Design Dynamic Island compact/expanded views
- [ ] Implement pause/resume functionality

### Phase 4: UI Updates (Week 4)
- [ ] Update `AlarmCard` with AlarmKit badge
- [ ] Update `AlarmEditModal` with permission request
- [ ] Update `Settings` with AlarmKit status
- [ ] Create migration banner component
- [ ] Update `AlarmCountdown` to show AlarmKit-powered countdowns

### Phase 5: Migration & Polish (Week 5)
- [ ] Implement automatic migration logic
- [ ] Create user onboarding flow
- [ ] Add graceful degradation for iOS < 26
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create user documentation

---

## Design Specifications (Aura Style Guide)

### Colors

```typescript
// AlarmKit-specific color palette (aligned with Aura v2.7.0)

export const AlarmKitColors = {
  // Primary
  alarmCyan: '#06b6d4',      // System alarm indicator
  alarmPink: '#e93488',       // Partner alarm indicator

  // Backgrounds
  darkBackground: '#0a0118',  // Primary dark
  purpleBackground: '#312e81', // Secondary purple

  // Accents
  glowCyan: 'rgba(6, 182, 212, 0.4)',
  glowPink: 'rgba(233, 52, 136, 0.4)',

  // Lock Screen
  lockScreenGradientStart: '#0a0118',
  lockScreenGradientEnd: '#312e81',

  // Text
  primaryText: '#ffffff',
  secondaryText: 'rgba(255, 255, 255, 0.7)',
  accentText: '#06b6d4',
};
```

### Typography

```swift
// For Live Activity widgets

.title: .system(size: 16, weight: .semibold)
.countdown: .system(size: 48, weight: .bold, design: .rounded)
.label: .system(size: 12, weight: .medium)
.button: .system(size: 14, weight: .semibold)
```

### Animations

```swift
// Breathing pulse for alarm countdown icon (match Heartline rhythm)

Animation.easeInOut(duration: 2.0).repeatForever(autoreverses: true)
// Scale: 1.0 → 1.08
// Opacity: 0.7 → 1.0
```

---

## Potential Challenges & Solutions

### Challenge 1: Expo Compatibility

**Problem:** AlarmKit requires native Swift code, but Expo typically abstracts native layer.

**Solution:**
- Use **Expo Config Plugins** for Info.plist modification
- Use **Expo Development Builds** (not Expo Go) to include custom native code
- Document requirement for `expo prebuild` and EAS Build

### Challenge 2: Widget Extension Setup

**Problem:** Live Activities require separate Widget Extension target, complex in React Native.

**Solution:**
- Create Widget Extension manually in Xcode
- Use CocoaPods to manage dependencies
- Provide step-by-step Xcode setup guide
- Consider using `react-native-live-activities` library (if compatible with Expo)

### Challenge 3: Timezone Conversion in Native Code

**Problem:** Alarm scheduling happens in Swift, but timezone conversion logic is in TypeScript.

**Solution:**
- **Option A:** Pass converted times from TypeScript → Native (simpler, less error-prone)
- **Option B:** Duplicate timezone conversion logic in Swift (more robust, handles edge cases)
- **Recommended:** Option A for initial implementation, Option B for production

### Challenge 4: Migration of Existing Alarms

**Problem:** Users may have many notification-based alarms that need migrating.

**Solution:**
- **Gradual migration**: Migrate alarms when user next edits them
- **Bulk migration**: Offer "Upgrade All Alarms" button in Settings
- **Preserve fallback**: Keep notification-based alarms as backup until migration confirmed successful

### Challenge 5: Testing AlarmKit

**Problem:** AlarmKit only available on iOS 26+ physical devices (not simulators in early releases).

**Solution:**
- Use **TestFlight** for beta testing with real devices
- Create **mock AlarmKit service** for Simulator testing
- Ensure fallback path (expo-notifications) is thoroughly tested on all platforms

---

## Success Metrics

### Functional Metrics
- [ ] 100% of alarms on iOS 26+ use AlarmKit
- [ ] 0% alarm failures due to Silent Mode/DND
- [ ] Timezone conversion accuracy: 100%
- [ ] Migration success rate: >95%

### User Experience Metrics
- [ ] Alarm authorization acceptance rate: >80%
- [ ] User satisfaction with full-screen alarms: >90%
- [ ] Live Activity engagement (view/interact): >60%

### Technical Metrics
- [ ] Bridge call latency: <50ms
- [ ] Widget load time: <200ms
- [ ] Crash rate: <0.1%

---

## Resources & References

### Official Documentation
- [AlarmKit Framework Documentation](https://developer.apple.com/documentation/AlarmKit)
- [WWDC 2025 Session 230: Wake up to the AlarmKit API](https://developer.apple.com/videos/play/wwdc2025/230/)
- [Live Activities Documentation](https://developer.apple.com/documentation/ActivityKit)
- [Dynamic Island HIG](https://developer.apple.com/design/human-interface-guidelines/live-activities)

### Community Resources
- [SwiftUI AlarmKit Tutorial](https://www.createwithswift.com/scheduling-and-managing-alarms-in-swiftui-with-alarmkit/)
- [AlarmKit Code Examples](https://github.com/jacobsapps/ADHDAlarms)
- [React Native Live Activities Library](https://github.com/margelo/react-native-live-activities)

### Internal References
- `/home/user/Aura-Your-Ambiance-Share-APP/ALARM_FEATURES.md` - Current alarm limitations
- `/home/user/Aura-Your-Ambiance-Share-APP/CLAUDE.md` - Aura architecture overview
- `/home/user/Aura-Your-Ambiance-Share-APP/docs/HEARTLINE_DESIGN.md` - Design language reference

---

## Timeline Estimate

**Total Duration:** 5-6 weeks (1 developer, full-time)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Research & Design | 1 week | This document, technical spike |
| Native Module Implementation | 1 week | Swift bridge, TypeScript service |
| Live Activities | 2 weeks | Widget Extension, Lock Screen UI, Dynamic Island |
| UI Integration | 1 week | Updated components, migration flow |
| Testing & Polish | 1 week | Unit tests, device testing, documentation |

**Critical Path:**
1. Native Module Bridge (blocking all other work)
2. Live Activities (parallel to UI updates)
3. Testing & Migration (requires complete implementation)

---

## Next Steps

1. **Review & Approval:** Present this document to stakeholders for approval
2. **Environment Setup:** Configure Xcode project with Widget Extension target
3. **Spike Task:** Implement minimal Native Module to validate approach (2 days)
4. **Detailed Implementation:** Follow phased checklist above
5. **Beta Testing:** Deploy to TestFlight for iOS 26+ device testing

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Claude (Aura Development Assistant)
**Status:** Draft for Review
