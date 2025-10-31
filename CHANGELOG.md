# Changelog

All notable changes to the Aura project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Fixed React Native Reanimated initialization error by importing at app entry point (`index.ts`)
- Resolved duplicate dependency conflicts in monorepo by removing root-level native dependencies
- Fixed React and React Native version mismatches between root and mobile workspace
- Corrected `react-native-svg` to use Expo SDK 54 compatible version (15.12.1)
- Fixed TypeScript compilation errors in mobile components
- All Expo doctor checks now pass (17/17)

### Changed
- Mobile app now matches web app visual design and animations
- Fixed peer dependency conflict for `react` by relaxing the version constraint in the `shared` package to resolve `npm install` errors
- Simplified AuraLogo animation to avoid Animated SVG conflicts
- Created mobile-specific `weatherUtils.ts` for gradient color mapping

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
