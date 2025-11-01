# Changelog

All notable changes to the Aura project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [2.1.0] - 2025-11-02

### Added
- **Contextual DST Warnings:** Implemented a new, robust Daylight Saving Time warning system centralized in the `Heartline` component.
  - When a DST change is imminent (today or within 14 days), a detailed warning appears, explaining the change (e.g., "fall back 1 hour") and its impact on the time difference.
  - When no change is imminent, a simple, persistent status shows the current timezone abbreviations (e.g., "PST / CST") for reference.

### Changed
- **DST Detection Engine:** Completely rewrote the DST detection logic in `dstUtils.ts` to use the `date-fns` and `date-fns-tz` libraries, ensuring robust and reliable detection of DST status and transitions, including edge cases like same-day changes.
- **Animation Pacing:** Reverted the main `ConnectionIntro` animation to its original, faster 8-second duration while preserving the longer text pause for a better user experience.

### Fixed
- **Critical UI Crash:** Fixed a series of `TypeError` and `ReferenceError` crashes in the `Settings` modal and `Heartline` component caused by incorrect DST function implementations and faulty imports.
- **Critical Layout Bug:** Restored the `AuraGlobe` components that were accidentally deleted, fixing a bug that caused the main screen to appear blank.
- **Settings Modal Scrolling:** Permanently fixed a persistent scrolling bug in the Settings modal by refactoring the layout to use `KeyboardAvoidingView` and a canonical, robust flexbox structure.
- **Time Difference Calculation:** Corrected a critical bug in the time difference logic that produced incorrect offsets (e.g., +9 instead of -15 hours).
- **Time Bridge Analog Clocks:** Rebuilt the non-functional analog clocks in the `TimeBridge` modal using `react-native-svg`.
- **Time Bridge UI Alignment:** Fixed multiple layout issues in the `TimeBridge` modal.
- **Location Input Flow:** Improved the UX of the location input screen by fixing keyboard appearance timing and preventing incorrect city name pre-filling.

### Dependencies
- Added `date-fns` and `date-fns-tz` to handle all timezone and DST calculations reliably.

### Added
- **Welcome Flow with Star Animation** - Re-implemented the initial setup experience
  - First star lights up when user enters their location
  - Second star appears when partner's location is entered
  - Both stars fly together and merge into the Aura logo
  - Beautiful background with animated starfield
  - Smooth transitions using React Native Animated API
  - ConnectionIntro animation plays after setup completion
- **Enhanced TimeBridge Modal** - Complete 24-hour timezone comparison table
  - Side-by-side comparison of all 24 hours for both timezones
  - Day/night indicators (sun/moon icons) for each hour
  - Current time highlighting with "NOW" badge
  - Real-time clock display at the top showing both locations' current times
  - Automatically updates every minute
  - Beautiful legend explaining the symbols
  - Scrollable table with smooth animations
  - Distance and time difference stats at the top
- **DST Indicators on Main Page** - Beautiful real-time status badges
  - Displays current DST status (DST or Standard Time) for both locations
  - Green badge for Daylight Saving Time, gray for Standard Time
  - **Animated warning badges** when time change is approaching (within 14 days)
  - Pulsing animation on warning badges to draw attention
  - Positioned elegantly on left side near each location
  - Automatically hides for locations that don't observe DST
- **Custom Nickname System** for personalizing locations
  - Set meaningful names like "My Love", "Mom", "Best Friend" for locations
  - Edit nicknames directly from Settings with instant save
  - Nicknames persist in AsyncStorage
  - Friendly placeholder suggestions for user guidance
- **Enhanced Settings Modal** with comprehensive location and timezone information
  - Beautiful dark-themed design matching app aesthetic
  - Displays detailed location coordinates and timezone information
  - Shows Daylight Saving Time (DST) status for both locations
  - **DST Transition Warnings**: Alerts when time changes are upcoming (within 14 days)
  - Proper modal overlay that prevents UI obstruction
  - Improved visual hierarchy and information architecture
- **DST Detection System** (`dstUtils.ts`):
  - Automatic detection of DST vs Standard Time
  - Calculates timezone offsets for both DST and standard periods
  - Checks for upcoming DST transitions up to 14 days in advance
  - Provides localized timezone names
  - Cross-platform compatible using Intl API

### Changed
- **Completely rewrote welcome/setup flow** to include star animations and logo combination effect
- **Replaced basic TimeBridge** with comprehensive 24-hour timezone comparison table
- **Redesigned DST indicators** with clearer labeling:
  - Normal state shows "Daylight Saving" or "Standard Time" instead of just "DST"
  - Warning state shows "Ending Soon" or "Starting Soon" with full description
  - Enhanced styling with better visibility and pulsing animation for warnings
- **Moved Settings button** from top-left to bottom-right corner to avoid iOS status bar and for better UX
- Replaced simple settings overlay with dedicated Settings component with full functionality
- Mobile app now matches web app visual design and animations
- Refactored `calculateTimeDifference()` to use reliable Intl API that works in both web and React Native environments
- Enhanced settings UI with dark theme and better visual feedback
- Improved information display with dedicated sections for locations, timezones, and custom names
- Removed unnecessary refresh button from main page (settings button now sole control)
- Fixed peer dependency conflict for `react` by relaxing the version constraint in the `shared` package to resolve `npm install` errors
- Simplified AuraLogo animation to avoid Animated SVG conflicts
- Created mobile-specific `weatherUtils.ts` for gradient color mapping
- Added `nickname` field to `LocationData` interface for personalization

### Dependencies
- Added `react-native-safe-area-context` for proper safe area handling

## [2.0.0] - 2025-11-01

### Added - Mobile App Major Redesign

#### Core Components
- **ConnectionIntro**: Animated splash screen with starry background, location markers, and connection flash animation
- **AuraLogo**: SVG logo component with draw-ring animation effect
- **BlendedSky**: Gradient blending system using MaskedView for smooth sky transitions between two weather states
- **CelestialSky**: Animated sun/moon component that follows realistic celestial paths based on actual sunrise/sunset times
- **ParticleSystem**: Ambient particle drift effect system (8 particles optimized for mobile)
- **AuraGlobe**: Location information panel displaying location name, timezone-aware clock, temperature, weather, and sunrise/sunset times
- **Heartline**: Interactive SVG connection curve between locations with distance and time difference stats
- **TimeBridge**: Modal component showing 24-hour timeline visualization with day/night segments and sunrise/sunset markers

#### Animation System
- Implemented comprehensive animation constants in `/apps/mobile/src/constants/Animations.ts`
- Created animation utility functions in `/apps/mobile/src/utils/animationUtils.ts`
- Added support for:
  - Fade in/out animations
  - Scale and pulse effects
  - SVG stroke animations
  - Particle drift with infinite repeat
  - Marker pop-in animations with spring easing
  - Connection flash effects

#### Dependencies
- Added `react-native-reanimated` (v4.1.1) for high-performance animations
- Added `react-native-svg` (v15.12.1) for SVG support
- Added `@react-native-masked-view/masked-view` (v0.3.2) for gradient blending effects

### Changed

#### Mobile App
- **Complete redesign** of main screen layout to match web version
- **Replaced** simple split-screen layout with blended sky system
- **Updated** Clock component to support timezone and custom styling props
- **Refactored** App.tsx with new component architecture:
  - ConnectionIntro shown on first load (3-second animation)
  - BlendedSky as main background
  - AuraGlobe components for location info (top and bottom)
  - Heartline for connection visualization
  - Settings and refresh buttons repositioned to top corners

#### Visual Improvements
- Changed from static gradients to dynamic blended gradients with smooth transitions
- Added celestial bodies (sun/moon) that move based on real time
- Added ambient particle effects throughout the screen
- Improved typography and text shadows for better readability
- Added proper animations for all interactive elements

### Documentation
- Created `MOBILE_WEB_SYNC.md` with comprehensive implementation details
- Documented Web vs Mobile comparison
- Added technical mapping between CSS animations and Reanimated
- Included implementation phases and progress tracking

## [1.0.0] - 2025-10-XX

### Added - Initial Release

#### Web App
- Initial web application with React 19.1.0 and Vite
- Weather data integration using Open-Meteo API
- Location search and geocoding
- Blended sky visualization with animated celestial bodies
- Particle effects and atmospheric animations
- TimeBridge modal with daily timeline
- Connection intro animation
- Responsive design with Tailwind CSS

#### Mobile App (Initial Version)
- React Native app with Expo (~54.0.20)
- Basic split-screen layout
- Location setup flow
- Weather data display
- Zustand state management with AsyncStorage persistence
- Simple gradient backgrounds

#### Shared Package
- Common types and interfaces
- Weather service (Open-Meteo API)
- Geocoding service
- Utility functions:
  - Distance calculation
  - Time difference calculation
  - Semantic time of day
  - Weather atmosphere mapping

### Project Structure
- Monorepo setup with separate web and mobile apps
- Shared package for common functionality
- TypeScript throughout

---

## Version Comparison

### Mobile App Evolution

#### v1.0.0 (Initial)
- Simple split-screen layout
- Static gradients
- Basic weather display
- No animations

#### v2.0.0 (Current)
- Blended sky system
- Full animation suite
- Celestial bodies
- Particle effects
- Interactive timeline
- Matches web design

### Web App
- v1.0.0: Initial release with full feature set
- Maintained stable through mobile redesign

---

## Migration Guide

### For Users

#### Upgrading from v1.0.0 to v2.0.0 (Mobile)

1. **Clear App Data** (Optional but recommended):
   - Your location preferences will be preserved
   - Weather data will refresh automatically

2. **First Launch**:
   - New animated intro will play (3 seconds)
   - After setup, enjoy the new visual experience!

### For Developers

#### Breaking Changes in Mobile v2.0.0

1. **Clock Component Interface Changed**:
   ```typescript
   // Old
   <Clock />

   // New (with timezone support)
   <Clock timeZone={weather.timezone} />
   ```

2. **New Required Dependencies**:
   ```bash
   npx expo install react-native-reanimated react-native-svg @react-native-masked-view/masked-view
   ```

3. **Babel Configuration Required**:
   ```javascript
   // babel.config.js must include:
   plugins: ['react-native-reanimated/plugin']
   ```

#### New Component APIs

```typescript
// ConnectionIntro - No props needed, auto-plays
<ConnectionIntro />

// BlendedSky
<BlendedSky
  myWeather={WeatherData}
  partnerWeather={WeatherData}
  distance={number}
/>

// AuraGlobe
<AuraGlobe
  location={LocationData}
  weather={WeatherData}
  position="top" | "bottom"
  distance={number}
/>

// Heartline
<Heartline
  distance={number}
  timeDifference={number}
  onShowDetails={() => void}
/>

// TimeBridge
<TimeBridge
  visible={boolean}
  onClose={() => void}
  myLocation={LocationData}
  partnerLocation={LocationData}
  myWeather={WeatherData}
  partnerWeather={WeatherData}
  distance={number}
  timeDifference={number}
/>
```

---

## Performance Notes

### Mobile v2.0.0 Optimizations

- **Particle Count**: Reduced from 20+ (web) to 8 for mobile performance
- **Animation Strategy**: Using `native driver` wherever possible
- **Rendering**: Optimized with proper component memoization
- **Memory**: Careful cleanup of animation timers and intervals

### Recommended Device Specs

- **iOS**: iPhone 8 or newer
- **Android**: Android 8.0+ with decent GPU
- For older devices, consider reducing particle count in `Animations.ts`

---

## Known Issues

### v2.0.0

- [ ] Weather icons in AuraGlobe currently use emoji placeholders (full lucide-react-native icon mapping pending)
- [ ] Gradient color mapping is simplified (can be more accurate to web version)
- [ ] Performance on older Android devices may vary (particle count adjustment may be needed)

---

## Roadmap

### v2.1.0 (Planned)
- [ ] Complete weather icon integration with lucide-react-native
- [ ] More accurate gradient color mapping
- [ ] Performance profiling and optimization
- [ ] Add haptic feedback for interactions
- [ ] Implement weather icon animations (bobble, spin, pulse)

### v2.2.0 (Planned)
- [ ] Dark mode toggle
- [ ] Custom location nicknames
- [ ] Weather alerts and notifications
- [ ] Share screenshot feature

### v3.0.0 (Future)
- [ ] Multiple location support
- [ ] Weather history charts
- [ ] Widget support (iOS/Android)
- [ ] Apple Watch companion app

---

## Credits

### Technologies Used

- **React** / **React Native** - UI Framework
- **Expo** - Mobile development platform
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Native Reanimated** - High-performance animations
- **React Native SVG** - Vector graphics
- **Lucide** - Icon library
- **Open-Meteo API** - Weather data
- **OpenStreetMap Nominatim** - Geocoding

### Design Inspiration

The visual design draws inspiration from:
- Weather visualization apps
- Ambient computing concepts
- Long-distance relationship connection apps

---

## License

This project is part of the Aura application suite.

---

**For detailed implementation notes, see [MOBILE_WEB_SYNC.md](./MOBILE_WEB_SYNC.md)**
