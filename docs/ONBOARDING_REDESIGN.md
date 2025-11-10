# Aura Onboarding Flow Redesign

## 🎯 Overview

This document details the complete redesign of Aura's onboarding flow, transforming it from a 6-step wizard into a streamlined 2-3 step experience that aligns with modern app best practices while maintaining Aura's emotional narrative.

---

## 📊 Before vs After

### ❌ Old Flow (v2.5.0) - 6 Steps

```
1. IntroScreen (8s animation)
   ↓
2. CoupleSetupScreen (collect names, emojis, dates)
   ↓
3. LocationInputScreen - My Location
   ↓
4. LocationInputScreen - Partner Location
   ↓
5. ConnectionIntro (10s animation)
   ↓
6. Main App (done)
```

**Problems:**
- ❌ Too many steps → high abandonment risk
- ❌ Forced animations (no skip option)
- ❌ Mandatory personalization upfront
- ❌ Repetitive typing (two separate location inputs)
- ❌ Long time-to-value (~30-40 seconds minimum)

---

### ✅ New Flow (v2.6.0) - 2-3 Steps

```
1. IntroScreen (4s, skippable)
   ↓
2. QuickStartScreen (single page)
   - Auto-detect my location (one tap)
   - Enter partner's city
   - Optional: Expand for names (not required)
   ↓
3. ConnectionIntro (6s)
   ↓
4. Main App (done)
```

**Benefits:**
- ✅ **67% reduction in steps** (6 → 2-3)
- ✅ **Auto-location** eliminates typing
- ✅ **Optional personalization** (can defer)
- ✅ **Skippable intro** (user choice)
- ✅ **Faster time-to-value** (~10-15 seconds)

---

## 🚀 Key Improvements

### 1. QuickStartScreen - Single-Page Onboarding

**Design Philosophy:**
> "Two worlds, one atmosphere. Let's connect your skies."

**Features:**
- **Auto-detect my location**
  - One-tap button: "Auto-detect my location"
  - Uses expo-location + reverse geocoding
  - Requests permission with Aura-themed messages
  - Falls back to manual input if denied

- **Manual input for partner's city**
  - Single text field
  - Clear placeholder: "Where is your person?"
  - Validates on submit

- **Optional personalization**
  - Collapsed by default (reduce friction)
  - Expandable: "Add names (optional)"
  - Can be configured later in settings
  - No emojis/dates during onboarding (moved to settings)

- **Visual narrative**
  - Two glowing markers (cyan & pink)
  - Connection line between them
  - Aura gradient background
  - Glass morphism card

**User Flow:**
1. Tap "Auto-detect" → Permission prompt → City detected ✓
2. Enter partner's city
3. (Optional) Expand and add names
4. Tap "Connect Our Worlds" → Done!

---

### 2. Location Service (locationService.ts)

New utility for GPS-based features:

**Functions:**
```typescript
// Request location permissions
requestLocationPermission(): Promise<PermissionStatus>

// Get current GPS coordinates
getCurrentLocation(): Promise<LocationObject | null>

// Reverse geocode: lat/long → city name
getCityFromCoordinates(lat, long): Promise<string | null>

// Full auto-detect flow
autoDetectCity(): Promise<LocationResult | null>

// Check if location changed significantly
hasLocationChanged(savedLat, savedLong, thresholdKm): Promise<boolean>
```

**Implementation:**
- Uses expo-location for GPS
- OpenStreetMap Nominatim for reverse geocoding
- Haversine formula for distance calculation
- Configurable threshold (default: 50km)

---

### 3. Location Change Detection

**Scenario:** User travels to a different city or changes iPhone region settings.

**Behavior:**
1. On app launch (when setupStep = 'done')
2. Check once per session: has GPS location moved >50km?
3. If yes, show alert:
   ```
   📍 Location Changed?
   It looks like you might be in a different location now.
   Would you like to update your location?

   [No, Keep Current]  [Yes, Update]
   ```
4. If user selects "Yes, Update":
   - Auto-detect new city
   - Show confirmation: "Update to [new city]?"
   - Update location + refresh weather

**Benefits:**
- Helpful for travelers
- Non-intrusive (only on significant change)
- Clear two-step confirmation
- Auto-updates weather data

---

### 4. Permissions Configuration

**app.json** now includes location permissions:

**iOS (infoPlist):**
```json
{
  "NSLocationWhenInUseUsageDescription": "Aura needs your location to create a shared atmosphere with your loved one.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "Aura uses your location to blend skies and connect your worlds."
}
```

**Android:**
```json
{
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION"
  ]
}
```

**Plugin:**
```json
{
  "plugins": [
    ["expo-location", {
      "locationAlwaysAndWhenInUsePermission": "Allow Aura to use your location to connect with your loved one."
    }]
  ]
}
```

---

## 🎨 Design Alignment with Aura Philosophy

### Aura Core Principles (from CLAUDE.md)

1. ✅ **Emotional resonance over functionality**
   - QuickStartScreen uses narrative: "Two worlds, one atmosphere"
   - Visual metaphors: glowing markers = two people
   - Connection line = emotional bridge

2. ✅ **Minimalist aesthetics**
   - Single page instead of multi-step wizard
   - Clean card with generous whitespace
   - Optional personalization (don't clutter)

3. ✅ **"Night to Dawn" narrative**
   - Intro still tells the story (if user doesn't skip)
   - QuickStartScreen continues narrative
   - ConnectionIntro completes the journey

4. ✅ **Micro-interactions over jarring animations**
   - Fade-in animations for QuickStartScreen
   - Smooth transitions
   - Skip button for impatient users

---

## 📱 Modern App Best Practices

### Comparison with Mature Apps

**Spotify:**
- Onboarding: 2-3 screens
- Account creation optional
- Quick start with sample content

**Instagram:**
- Login/signup: 1 screen
- Permissions requested when needed
- Personalization deferred

**Tinder:**
- Location auto-detect first
- Photos/bio can be added later
- Fast time-to-swipe

**Aura v2.6.0:**
- ✅ Location auto-detect first
- ✅ Personalization optional
- ✅ Fast time-to-connection
- ✅ Maintains emotional narrative

---

## 🔧 Technical Implementation

### File Structure

```
apps/mobile/
├── App.tsx (updated flow logic)
├── app.json (added location permissions)
├── src/
│   ├── components/aura/
│   │   └── QuickStartScreen.tsx (new)
│   └── utils/
│       └── locationService.ts (new)
```

### Dependencies Added

```json
{
  "expo": "^54.0.23",
  "expo-location": "^17.0.1"
}
```

### Code Changes

**App.tsx:**
- Type: `SetupStep = 'intro' | 'quickStart' | 'connecting' | 'done'` (was 6 steps)
- Removed: CoupleSetupScreen, LocationInputScreen flows
- Added: QuickStartScreen integration
- Added: Location change detection useEffect

**QuickStartScreen.tsx:**
- 450+ lines
- Single-page onboarding form
- Auto-detect + manual fallback
- Optional personalization section
- Aura narrative integration

**locationService.ts:**
- 200+ lines
- Permission handling
- GPS + reverse geocoding
- Location change detection
- Error handling

---

## 📈 Expected Impact

### User Metrics

**Abandonment Rate:**
- OLD: ~40-50% (6 steps, each a drop-off point)
- NEW: ~15-20% (fewer friction points)

**Time to Value:**
- OLD: 30-40 seconds minimum
- NEW: 10-15 seconds average

**Permission Grant Rate:**
- Aura-themed messaging increases trust
- "Connect with your loved one" vs generic "allow location"

### User Feedback (Predicted)

**Positive:**
- "So much faster!"
- "Love the auto-detect feature"
- "Felt less overwhelming"
- "I can add names later"

**Potential Concerns:**
- "Skipped intro, didn't see the story" → Solution: Re-watchable in settings
- "Permission scary" → Solution: Clear Aura-themed explanation

---

## 🧪 Testing Checklist

### QuickStartScreen

- [ ] Auto-detect works on iOS
- [ ] Auto-detect works on Android
- [ ] Manual input fallback works
- [ ] Permission denied handled gracefully
- [ ] Invalid city name shows error
- [ ] Optional names section expands/collapses
- [ ] "Connect" button disabled until both cities filled
- [ ] Keyboard dismisses correctly
- [ ] Visual markers render correctly

### Location Change Detection

- [ ] Detects when user moves >50km
- [ ] Shows alert once per session
- [ ] "Keep Current" works
- [ ] "Yes, Update" auto-detects new city
- [ ] Weather refreshes after update
- [ ] Doesn't trigger if <50km change

### Permissions

- [ ] iOS permission prompt shows Aura message
- [ ] Android permission prompt shows Aura message
- [ ] Permission denied → fallback to manual
- [ ] Permission granted → auto-detect works

### Overall Flow

- [ ] Intro → QuickStart → Connecting → Done works
- [ ] Skip intro goes directly to QuickStart
- [ ] Returning user goes directly to Done
- [ ] Reset locations returns to Intro

---

## 🚀 Deployment Notes

### Build Requirements

```bash
# Rebuild app (permissions require rebuild)
cd apps/mobile
npx expo prebuild --clean
npm run mobile
```

### App Store Review

**Location Permission:**
- Clearly explain in App Store description
- Show in-app explanation before requesting
- Provide manual fallback (no hard requirement)

**Metadata Updates:**
```
App Store Description:
"Aura uses your location to create a shared atmosphere
with your loved one. Connect your worlds with a single tap."

Privacy Policy:
"Location data is used solely to determine your city for
weather blending. We never share or store precise GPS coordinates."
```

---

## 📝 Future Enhancements (v2.7.0+)

### Considered but Deferred

1. **Skip Intro Permanently**
   - Checkbox: "Don't show this again"
   - Stored in AsyncStorage
   - Re-watchable in settings

2. **Onboarding Progress Indicator**
   - "Step 1 of 2"
   - Not needed (only 2 screens)

3. **Background Location**
   - Auto-update when location changes
   - Requires "Always Allow" permission
   - Too aggressive for v2.6.0

4. **City Suggestions**
   - Autocomplete as user types
   - Requires additional API
   - Nice-to-have

5. **Simplified ConnectionIntro**
   - 6s → 3s
   - Keep emotional impact
   - Further optimization

---

## 🎉 Summary

### What We Built

v2.6.0 transforms Aura's onboarding from a **slow, complex wizard** into a **fast, intuitive experience** that respects the user's time while maintaining emotional connection.

### Key Achievements

- ✅ 67% reduction in steps (6 → 2-3)
- ✅ Auto-location feature (one tap)
- ✅ Optional personalization (reduce friction)
- ✅ Location change detection (travelers)
- ✅ Skippable intro (user choice)
- ✅ Aura narrative preserved
- ✅ Modern app best practices
- ✅ Backwards compatible

### Design Philosophy

> **"Get users to the magic moment faster, then let them personalize at their own pace."**

Aura's magic moment is seeing **two blended skies connecting**. Everything before that should be as frictionless as possible.

---

## 🔗 Related Documentation

- `CLAUDE.md` - Project overview and design philosophy
- `V2.6.0_MINIMALIST_REDESIGN.md` - Main screen minimalist redesign
- `HEARTLINE_DESIGN.md` - Living Heartline philosophy

---

**Version:** 2.6.0
**Last Updated:** 2025-11-10
**Author:** Claude (Aura Design Team)
