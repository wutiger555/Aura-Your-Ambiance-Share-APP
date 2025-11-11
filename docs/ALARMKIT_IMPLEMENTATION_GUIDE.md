# AlarmKit Implementation Guide

**Version:** 2.8.0
**Last Updated:** 2025-11-11
**Status:** Ready for Implementation

This guide provides step-by-step instructions for implementing the AlarmKit integration in Aura. For architectural details, see `/docs/ALARMKIT_INTEGRATION.md`.

---

## Prerequisites

### System Requirements
- **macOS:** 14.0+ (for Xcode 26)
- **Xcode:** 26.0+ (includes iOS 26 SDK and AlarmKit framework)
- **Node.js:** 18.0+
- **npm:** 9.0+
- **Expo SDK:** 54 (current Aura version)
- **iOS Device:** iPhone running iOS 26.0+ (for testing AlarmKit features)

### Knowledge Requirements
- React Native & TypeScript
- iOS native development (Swift)
- Expo Config Plugins
- Widget Extensions (for Live Activities)

---

## Implementation Phases

## Phase 1: Xcode Project Setup (Week 1, Day 1-2)

### Step 1.1: Add Native Module Files

The following files have been created in `/apps/mobile/ios/Modules/`:
- `AuraAlarmKitModule.swift` - Native AlarmKit bridge
- `AuraAlarmKitModule.m` - Objective-C bridge header

**Task:** Add these files to your Xcode project:

1. Open `/apps/mobile/ios/Aura.xcworkspace` in Xcode
2. Right-click on `Aura` project → "Add Files to Aura..."
3. Navigate to `/apps/mobile/ios/Modules/`
4. Select both `AuraAlarmKitModule.swift` and `AuraAlarmKitModule.m`
5. ✅ Check "Copy items if needed"
6. ✅ Check "Create groups"
7. ✅ Select target: "Aura"
8. Click "Add"

### Step 1.2: Configure Swift Bridging Header

If you don't already have a bridging header:

1. In Xcode, go to **File** → **New** → **File**
2. Select **Header File**
3. Name it `Aura-Bridging-Header.h`
4. Save it in `/apps/mobile/ios/`
5. Add the following content:

```objc
//
//  Aura-Bridging-Header.h
//  Aura
//

#ifndef Aura_Bridging_Header_h
#define Aura_Bridging_Header_h

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#endif /* Aura_Bridging_Header_h */
```

6. Update **Build Settings**:
   - Select `Aura` target
   - Search for "Objective-C Bridging Header"
   - Set value to: `Aura/Aura-Bridging-Header.h`

### Step 1.3: Update Info.plist

The Expo Config Plugin will handle this automatically, but for manual setup:

1. Open `/apps/mobile/ios/Aura/Info.plist`
2. Add the following key:

```xml
<key>NSAlarmKitUsageDescription</key>
<string>Aura schedules alarms to help you connect with your partner across timezones at the perfect moment. These alarms will work even when your device is in Silent Mode or Do Not Disturb.</string>
```

### Step 1.4: Verify Swift Compiler Settings

1. Select `Aura` target in Xcode
2. Go to **Build Settings**
3. Search for "Swift Compiler - Language"
4. Set **Swift Language Version** to: `Swift 6` (or latest available)

---

## Phase 2: Widget Extension Setup (Week 1, Day 3-5)

### Step 2.1: Create Widget Extension Target

1. In Xcode, go to **File** → **New** → **Target**
2. Select **Widget Extension**
3. Configure:
   - **Product Name:** `AlarmCountdownWidget`
   - **Team:** Your development team
   - **Organization Identifier:** `com.aura` (or your identifier)
   - **Language:** Swift
   - **Include Configuration Intent:** ❌ Uncheck (not needed for Live Activities)
4. Click **Finish**
5. When prompted "Activate 'AlarmCountdownWidget' scheme?", click **Activate**

### Step 2.2: Add Live Activity Widget Code

1. Delete the default `AlarmCountdownWidget.swift` file created by Xcode
2. Copy the pre-created file:
   - From: `/apps/mobile/ios/AlarmCountdownWidget/AlarmCountdownWidget.swift`
   - To: Xcode project under `AlarmCountdownWidget` folder
3. Ensure the file is added to the `AlarmCountdownWidget` target (not `Aura`)

### Step 2.3: Configure Widget Extension Info.plist

1. Open `/apps/mobile/ios/AlarmCountdownWidget/Info.plist`
2. Verify these keys exist:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
<key>CFBundleDisplayName</key>
<string>Aura Alarms</string>
<key>MinimumOSVersion</key>
<string>26.0</string>
```

### Step 2.4: Update Podfile

1. Open `/apps/mobile/ios/Podfile`
2. Add Widget Extension target at the end:

```ruby
target 'AlarmCountdownWidget' do
  inherit! :search_paths
end
```

3. Run in terminal:

```bash
cd apps/mobile/ios
pod install
```

---

## Phase 3: TypeScript Integration (Week 2, Day 1-3)

### Step 3.1: Install Dependencies (if needed)

All dependencies should already be present, but verify:

```bash
cd /home/user/Aura-Your-Ambiance-Share-APP
npm install
```

### Step 3.2: Update app.json with Config Plugin

Edit `/apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "Aura",
    "plugins": [
      "./plugins/withAlarmKit"
    ]
  }
}
```

### Step 3.3: Run Expo Prebuild

This generates native iOS project files with the Config Plugin applied:

```bash
cd apps/mobile
npx expo prebuild --platform ios --clean
```

**Note:** This will overwrite your iOS project. Ensure you've committed any Xcode changes first.

### Step 3.4: Verify Native Module Availability

Create a test file `/apps/mobile/src/test/alarmKitTest.ts`:

```typescript
import { NativeModules } from 'react-native';

export function testAlarmKitModule() {
  const { AuraAlarmKitModule } = NativeModules;

  if (AuraAlarmKitModule) {
    console.log('✅ AlarmKit Native Module loaded successfully');
    console.log('Module constants:', AuraAlarmKitModule.getConstants?.());
  } else {
    console.error('❌ AlarmKit Native Module not found');
  }
}
```

---

## Phase 4: UI Integration (Week 2, Day 4-5)

### Step 4.1: Initialize AlarmKit Capabilities on App Launch

Edit `/apps/mobile/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useAlarmStore } from './src/stores/useAlarmStore';
import { AlarmKitService } from './src/services/alarmKitService';

// In your main App component, add this useEffect:
useEffect(() => {
  async function initializeAlarmKit() {
    try {
      const capabilities = await AlarmKitService.getCapabilities();
      useAlarmStore.getState().setAlarmKitCapabilities(capabilities);

      console.log('[App] AlarmKit capabilities:', capabilities);
    } catch (error) {
      console.error('[App] Failed to initialize AlarmKit:', error);
    }
  }

  initializeAlarmKit();
}, []);
```

### Step 4.2: Add Migration Banner to Main Screen

Edit `/apps/mobile/src/components/aura/BlendedSky.tsx` (or wherever your main screen is):

```typescript
import AlarmKitMigrationBanner from './AlarmKitMigrationBanner';

// Inside your main screen JSX:
return (
  <View style={styles.container}>
    {/* Existing components */}

    {/* AlarmKit Migration Banner (v2.8.0) */}
    <AlarmKitMigrationBanner />

    {/* Rest of your components */}
  </View>
);
```

### Step 4.3: Update AlarmEditModal to Use HybridAlarmService

Edit `/apps/mobile/src/components/aura/AlarmEditModal.tsx`:

```typescript
import { HybridAlarmService } from '../../services/hybridAlarmService';

// Replace NotificationService calls with HybridAlarmService:

const handleSave = async () => {
  // ... existing validation code ...

  const { myWeather, partnerWeather, myLocation, partnerLocation } = useLocationStore.getState();
  const referenceTimezone = newAlarm.timeZoneReference === 'my' ? myWeather.timezone : partnerWeather.timezone;
  const localTimezone = myWeather.timezone;

  // Use HybridAlarmService instead of direct NotificationService
  const result = await HybridAlarmService.scheduleAlarm({
    alarm: newAlarm,
    referenceTimezone,
    localTimezone,
    myLocationName: myLocation.name,
    partnerLocationName: partnerLocation.name,
  });

  if (result.success) {
    // Update alarm with returned ID
    const updatedAlarm = {
      ...newAlarm,
      alarmKitID: result.alarmKitID,
      notificationID: result.notificationID,
    };

    useAlarmStore.getState().addAlarm(updatedAlarm);
    console.log(`[AlarmEditModal] Alarm scheduled via ${result.method}`);
  } else {
    Alert.alert('Error', `Failed to schedule alarm: ${result.error}`);
  }
};
```

### Step 4.4: Update AlarmCard to Show AlarmKit Badge

Edit `/apps/mobile/src/components/aura/AlarmCard.tsx`:

```typescript
// Add after existing alarm info display:

{alarm.alarmKitID && (
  <View style={styles.systemAlarmBadge}>
    <Bell size={10} color="#06b6d4" strokeWidth={2.5} />
    <Text style={styles.systemAlarmText}>System Alarm</Text>
  </View>
)}

// Add to styles:
systemAlarmBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
  backgroundColor: 'rgba(6, 182, 212, 0.15)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(6, 182, 212, 0.3)',
},
systemAlarmText: {
  fontSize: 10,
  fontWeight: '600',
  color: '#06b6d4',
  letterSpacing: 0.3,
},
```

---

## Phase 5: Testing (Week 3)

### Step 5.1: Build and Run on iOS Simulator

**Note:** AlarmKit may not be fully functional in the Simulator. Use for initial testing only.

```bash
cd apps/mobile
npm run mobile
# Then press 'i' to open iOS Simulator
```

### Step 5.2: Build for Physical Device

1. Connect iPhone running iOS 26+ via USB
2. In Xcode:
   - Select your iPhone as the build target
   - Configure signing (use your Apple Developer account)
   - Click **Run** (▶️)

### Step 5.3: Test AlarmKit Authorization Flow

1. Launch app on physical device
2. Create a new alarm
3. You should see iOS system prompt: "Aura Would Like to Schedule Alarms"
4. Tap **Allow**
5. Verify alarm is created with AlarmKit ID

### Step 5.4: Test Lock Screen Display

1. Schedule an alarm for 1-2 minutes from now
2. Lock your iPhone
3. When alarm triggers, verify:
   - ✅ Full-screen alarm display
   - ✅ Aura branding visible
   - ✅ Location names shown
   - ✅ Works in Silent Mode
   - ✅ Works with Do Not Disturb

### Step 5.5: Test Dynamic Island (iPhone 14 Pro+)

If using iPhone 14 Pro or later:

1. Schedule a countdown timer alarm
2. Verify Live Activity appears in Dynamic Island
3. Check compact, expanded, and minimal states

### Step 5.6: Test Migration Flow

1. Create alarms using old notification system (on iOS <26 or disable AlarmKit temporarily)
2. Update to iOS 26+
3. Launch app
4. Verify migration banner appears
5. Tap "Upgrade Now"
6. Verify alarms are migrated successfully

---

## Phase 6: Production Deployment (Week 4)

### Step 6.1: Update CHANGELOG.md

Add entry for v2.8.0:

```markdown
## [2.8.0] - 2025-XX-XX

### Added
- **AlarmKit Integration (iOS 26+):** System-level alarms that penetrate Silent Mode and Do Not Disturb
- **Full-Screen Lock Screen Display:** Native iOS alarm presentation with Aura branding
- **Dynamic Island Support:** Live countdown timers in Dynamic Island (iPhone 14 Pro+)
- **Live Activities:** Real-time alarm countdown on Lock Screen
- **Automatic Migration:** Seamlessly upgrade notification-based alarms to AlarmKit
- **Hybrid Alarm System:** Graceful fallback to notifications on iOS <26 and Android

### Changed
- Alarm scheduling now uses AlarmKit when available, with automatic fallback
- Alarm cards now display "System Alarm" badge for AlarmKit-powered alarms

### Technical
- Added native Swift module for AlarmKit bridge
- Created Widget Extension for Live Activities
- Implemented Expo Config Plugin for Info.plist configuration
- Updated Alarm type definition with `alarmKitID` field
```

### Step 6.2: Build for TestFlight

```bash
# Using EAS Build (recommended for Expo)
cd apps/mobile
eas build --platform ios --profile production

# Or using Xcode directly:
# 1. Archive in Xcode: Product → Archive
# 2. Upload to App Store Connect
```

### Step 6.3: Beta Testing Checklist

- [ ] AlarmKit authorization works on fresh install
- [ ] Alarms trigger correctly in Silent Mode
- [ ] Alarms trigger correctly with Do Not Disturb enabled
- [ ] Full-screen display shows Aura branding
- [ ] Multi-timezone conversion is accurate
- [ ] Migration from old alarms works smoothly
- [ ] Dynamic Island displays countdown correctly
- [ ] App doesn't crash on iOS <26 (fallback works)
- [ ] No memory leaks from Native Module

### Step 6.4: App Store Submission

Update App Store listing:

**What's New in This Version:**

```
🔔 System-Level Alarms (iOS 26+)

Your alarms just got a major upgrade! On iOS 26 and later, Aura now uses Apple's new AlarmKit framework:

✓ Works even in Silent Mode
✓ Penetrates Do Not Disturb
✓ Full-screen alarm display on Lock Screen
✓ Live countdown in Dynamic Island
✓ Perfect for connecting across timezones

Existing alarms will automatically upgrade when you update to iOS 26.

[Rest of your release notes...]
```

---

## Troubleshooting

### Issue: "AlarmKit module not found"

**Solution:**
1. Verify files are added to Xcode project
2. Run `npx expo prebuild --clean`
3. Clean build folder in Xcode (Cmd+Shift+K)
4. Rebuild app

### Issue: "Undefined symbol: _AlarmManager"

**Solution:**
1. Ensure iOS Deployment Target is set to 26.0+
2. Check that you're building with Xcode 26+
3. Verify `import AlarmKit` in Swift file

### Issue: Widget Extension not showing

**Solution:**
1. Verify Widget Extension target is active
2. Check Widget Extension deployment target is 26.0+
3. Ensure `ActivityKit` is imported in Widget code
4. Test on physical device (Simulator support may be limited)

### Issue: Alarms not triggering in Silent Mode

**Cause:** Using notification-based fallback instead of AlarmKit

**Solution:**
1. Check `alarmKitCapabilities.authorizationStatus === 'authorized'`
2. Verify alarm has `alarmKitID` (not just `notificationID`)
3. Review logs for AlarmKit scheduling errors

### Issue: Migration banner not appearing

**Check:**
1. AlarmKit is available: `AlarmKitService.isAvailable() === true`
2. User has notification-based alarms: `getAlarmsUsingNotifications().length > 0`
3. Banner not dismissed: `dismissed === false`
4. Locations are set: `myLocation && partnerLocation`

---

## Performance Considerations

### Native Module Overhead

- AlarmKit bridge calls are async (Promise-based)
- Typical latency: <50ms
- No significant performance impact on UI thread

### Widget Extension Memory

- Live Activity widgets run in separate process
- Memory budget: ~30MB
- Use lightweight views and minimize image assets

### Battery Impact

- AlarmKit alarms use system services (no app wake)
- Negligible battery impact compared to notification-based alarms
- Live Activities update automatically by system

---

## Maintenance

### Regular Tasks

- **Monitor Crash Reports:** Check for AlarmKit-related crashes in production
- **Update for New iOS Versions:** Test compatibility with iOS 27+ betas
- **Review AlarmKit API Changes:** Watch WWDC sessions for framework updates

### Known Limitations

1. **iOS 26+ Only:** AlarmKit unavailable on older iOS versions (fallback to notifications)
2. **Physical Device Required:** Full testing requires real iPhone (Simulator limited)
3. **Limited UI Customization:** Full-screen alarm uses system template (title, message, colors only)
4. **No Android Support:** AlarmKit is iOS-only (Android uses expo-notifications)

---

## Resources

### Documentation
- [AlarmKit Framework (Apple)](https://developer.apple.com/documentation/AlarmKit)
- [WWDC 2025 Session 230](https://developer.apple.com/videos/play/wwdc2025/230/)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-ios)

### Internal Docs
- `/docs/ALARMKIT_INTEGRATION.md` - Architecture and design
- `/ALARM_FEATURES.md` - Original alarm system documentation
- `/CLAUDE.md` - Aura project overview

### Community
- [Aura GitHub Issues](https://github.com/wutiger555/Aura-Your-Ambiance-Share-APP/issues)
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://github.com/react-native-community)

---

## Next Steps

After completing this implementation:

1. **User Testing:** Gather feedback from beta users on iOS 26+
2. **Analytics:** Track AlarmKit adoption rate and authorization acceptance
3. **Optimization:** Monitor performance and optimize based on real-world usage
4. **Future Enhancements:**
   - Countdown timer mode with more granular Live Activity controls
   - Custom alarm sounds from partner's location weather
   - Integration with Apple Watch complications

---

**Document Version:** 1.0
**Implementation Status:** Ready for Phase 1
**Estimated Completion:** 4 weeks (1 developer, full-time)

Good luck with the implementation! 🚀
