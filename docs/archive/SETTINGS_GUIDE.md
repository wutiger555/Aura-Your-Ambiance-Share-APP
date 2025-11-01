# Settings Feature Guide

## Overview

The enhanced Settings modal provides comprehensive location and timezone information, including automatic Daylight Saving Time (DST) detection and transition warnings.

## Features

### 1. Enhanced Visual Design

- **Gradient Background**: Beautiful gradient matching the app's aesthetic
- **Proper Modal Overlay**: Semi-transparent backdrop with proper z-index to prevent UI obstruction
- **Organized Sections**: Clear separation between location info, timezone details, and actions
- **Responsive Layout**: Scrollable content that adapts to different screen sizes

### 2. Location Information

Each location displays:
- Location name
- Precise coordinates (latitude/longitude with 4 decimal precision)
- Visual badge distinguishing "Me" from "Partner"
- Current DST status

### 3. Daylight Saving Time (DST) Detection

The app automatically detects and displays:

#### Current DST Status
- **"Daylight Saving Time"**: Location is currently in DST
- **"Standard Time"**: Location is currently in standard time
- **"No DST observed"**: Location doesn't observe DST

#### Timezone Offset Information
- Shows current UTC offset
- Displays both standard and DST offsets when applicable
- Example: `Currently in DST (UTC+2)` or `Standard Time (UTC+1)`

### 4. DST Transition Warnings

When a time change is approaching (within 14 days), a prominent warning banner appears:

#### Warning Levels
- **1 day**: "Switching to [DST/Standard Time] tomorrow"
- **2-3 days**: "Switching to [DST/Standard Time] in X days"
- **4-7 days**: "Switching to [DST/Standard Time] in X days"
- **8-14 days**: "Switching to [DST/Standard Time] in X days"

#### Visual Design
- Orange gradient background with alert icon
- Clear warning title "Time Change Alert"
- Separate warnings for each location if both are transitioning

### 5. Timezone Details Section

Displays full timezone information:
- IANA timezone name (e.g., "America/New_York", "Europe/Paris")
- Current time offset status
- Distinction between standard and DST periods

## Technical Implementation

### DST Detection Algorithm

The DST detection system uses `Intl.DateTimeFormat` API for reliable cross-platform compatibility:

1. **Offset Calculation**: Compares timezone offsets in January (winter) vs July (summer)
2. **DST Determination**: If offsets differ, location observes DST
3. **Current Status**: Compares current offset to determine if DST is active
4. **Transition Detection**: Checks each day for 14 days ahead to find transition dates

### Files Created

- `/apps/mobile/src/utils/dstUtils.ts` - DST detection utilities
- `/apps/mobile/src/components/Settings.tsx` - Enhanced Settings component

### Key Functions

```typescript
// Check if DST is currently active
isDaylightSavingTime(timeZone: string, date?: Date): boolean

// Get comprehensive DST information
getDSTInfo(timeZone: string): DSTInfo

// Format DST status for display
formatDSTStatus(dstInfo: DSTInfo): string
```

## Usage

### Opening Settings

Click the settings icon in the top-left corner of the main screen.

### Viewing DST Information

DST information is automatically calculated and displayed:
- Check the clock icon next to each location for current DST status
- Look for the orange warning banner if transitions are upcoming
- View detailed timezone information in the "Time Zone Details" section

### Resetting Locations

1. Open Settings
2. Scroll to bottom
3. Tap "Reset Locations" button
4. Confirm in the alert dialog

## Design Philosophy

The Settings modal follows the app's existing design language:

### Color Palette
- **Primary**: Cyan (`#06b6d4`) for "Me"
- **Partner**: Pink (`#ec4899`) for "Partner"
- **Warning**: Orange (`#fb923c`) for DST alerts
- **Destructive**: Red (`#ef4444`) for reset action
- **Background**: Dark slate with gradient overlays

### Typography
- **Title**: 28px bold for modal title
- **Section Headers**: 18px semi-bold with icons
- **Location Names**: 20px bold
- **Details**: 13-14px regular for metadata

### Spacing & Layout
- Consistent 16-20px padding
- 12-24px margins between sections
- Rounded corners (12-24px radius)
- Semi-transparent overlays for depth

## Browser/Platform Compatibility

The DST detection system is built using:
- ✅ `Intl.DateTimeFormat` API (supported in all modern browsers and React Native)
- ✅ No external dependencies
- ✅ No API keys required
- ✅ Works offline
- ✅ Cross-platform compatible (iOS, Android, Web)

## Known Limitations

1. **Historical Accuracy**: DST rules may change; detection is based on current year's rules
2. **14-Day Window**: Only checks for transitions within the next 14 days
3. **Daily Granularity**: Transition warnings show day-level precision, not exact time

## Future Enhancements

Potential improvements for future versions:

- [ ] Show exact time of DST transition (e.g., "2:00 AM Sunday")
- [ ] Historical DST transition log
- [ ] Option to customize warning period (7/14/30 days)
- [ ] Push notifications for upcoming transitions
- [ ] Multiple timezone comparison
- [ ] DST calendar visualization

## Troubleshooting

### DST Status Not Showing

If DST information doesn't appear:

1. Ensure locations are properly set up
2. Check that weather data has loaded (includes timezone info)
3. Verify internet connection for initial timezone data

### Incorrect DST Status

If DST status appears incorrect:

1. Verify the location's timezone is correct
2. Check the device's date/time settings
3. Ensure the app is up to date

### Warning Not Appearing

If you expect a DST warning but don't see one:

1. DST transition must be within 14 days
2. Both the current date and transition date must be in the current year
3. Location must observe DST (some regions don't)

## Examples

### Locations That Observe DST
- **New York** (America/New_York): Spring forward (March), Fall back (November)
- **London** (Europe/London): Spring forward (March), Fall back (October)
- **Sydney** (Australia/Sydney): Spring forward (October), Fall back (April)

### Locations That Don't Observe DST
- **Phoenix** (America/Phoenix): No DST
- **Tokyo** (Asia/Tokyo): No DST
- **Hawaii** (Pacific/Honolulu): No DST
- **Singapore** (Asia/Singapore): No DST

---

**Last Updated**: 2025-11-01
**Version**: 2.1.0 (Unreleased)
