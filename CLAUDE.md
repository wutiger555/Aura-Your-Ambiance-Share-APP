# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aura is a digital sanctuary for long-distance couples that transforms real-time weather and time data into a blended visual experience. The app follows a "Night to Dawn" narrative arc, symbolizing the journey from separation to connection. Design choices prioritize emotional resonance over functionality, with a focus on minimalist aesthetics and meaningful micro-interactions.

## Architecture

This is a **TypeScript monorepo** with three main packages:

- **`apps/mobile/`**: React Native (Expo SDK 54) mobile app - **primary development focus**
- **`apps/web/`**: React + Vite web application
- **`packages/shared/`**: Shared business logic, types, API services, and utilities

### Technology Stack

**Mobile App:**
- Framework: React Native with Expo SDK 54
- State Management: Zustand with AsyncStorage persistence
- Animation: React Native Reanimated v4 (must be initialized first in `index.ts` and configured last in `babel.config.js`)
- UI: StyleSheet, `expo-linear-gradient`, `expo-blur`
- Date/Time: `date-fns` and `date-fns-tz` (used for DST handling)

**APIs (No Keys Required):**
- **Open-Meteo**: Weather data (temperature, conditions, sunrise/sunset, timezone)
- **OpenStreetMap Nominatim**: Geocoding with 1 request/second rate limit (automatically handled)

## Common Commands

```bash
# Install dependencies for all workspaces
npm install

# Run mobile app (normal development)
npm run mobile
# or from apps/mobile:
npx expo start

# Run mobile app with clean cache (after package changes or when code changes don't appear)
npm run mobile -- --clear
# or from apps/mobile:
npx expo start -c

# Run web app
npm run web

# Type check all workspaces
npm run type-check

# Complete clean reinstall ("nuke" option)
npm run clean
npm install
cd apps/mobile && npx expo start -c

# Check for dependency issues
cd apps/mobile && npx expo-doctor
```

**Important**: Use `npx expo start -c` (clear cache) after installing/updating packages or when animations don't play. This clears Metro Bundler cache but does NOT clear AsyncStorage (saved locations).

## Application Flow & State Management

### Setup Flow State Machine (`App.tsx`)

The app follows a sequential setup flow controlled by `setupStep`:

1. **`'intro'`**: Immersive `IntroScreenRedesign` (8-second narrative journey)
   - 4-act structure: Two globes appear → Aura Logo emerges → Energy lines connect → Heartline preview
   - Narrative: "Two people." → "Different skies." → "One shared atmosphere."
2. **`'inputMy'`**: User inputs their location in `LocationInputScreen` (cyan marker with pulse)
3. **`'inputPartner'`**: User inputs partner's location (pink marker)
4. **`'connecting'`**: Full-screen `ConnectionIntroRedesign` animation (10 seconds)
   - 5-act structure: Globes pulse → Breathe → Map emerges → Heartline forms → Fade to main
   - Shows actual city names: "{City} ✦ {City}"
5. **`'done'`**: Main blended sky experience with living Heartline and weather effects

### Zustand State Stores

**`useLocationStore`** (persisted to AsyncStorage):
- Stores `myLocation` and `partnerLocation` (type: `LocationData`)
- Sets `hasSetup: true` only when both locations are present
- Provides `updateNicknames()` and `clearLocations()` methods

**`useWeatherStore`** (in-memory only):
- Stores `myWeather` and `partnerWeather` (type: `WeatherData`)
- Manages `isLoading` and `error` states
- Weather data is fetched fresh when app reaches `'done'` state

### Key Data Types (`packages/shared/types/index.ts`)

```typescript
LocationData {
  name: string;
  latitude: number;
  longitude: number;
  nickname?: string;
}

WeatherData {
  timezone: string; // IANA timezone (e.g., "America/New_York")
  current: { time, temperature_2m, is_day, weather_code }
  daily: { time[], sunrise[], sunset[] }
}
```

## Critical Implementation Details

### React Native Reanimated Configuration

**MUST follow this exact setup to avoid errors:**

1. **`apps/mobile/index.ts`**: `import 'react-native-reanimated';` **must be the very first line**
2. **`apps/mobile/babel.config.js`**: `'react-native-reanimated/plugin'` **must be the last plugin**

### DST (Daylight Saving Time) Handling

**All DST logic uses `date-fns-tz` library** (`apps/mobile/src/utils/dstUtils.ts`):
- NO manual date math - all calculations use `getTimezoneOffset` from `date-fns-tz`
- `getDSTInfo(timezone)` returns DST status, offsets, timezone abbreviation, and transition warnings
- **`Heartline.tsx` is the single source of truth** for displaying DST information to users
- Displays yellow warning for transitions within 14 days (including same-day changes)
- Shows white timezone abbreviation in normal conditions

### Animation Timing Constants

Defined in `apps/mobile/src/constants/Animations.ts`:
- `CONNECTION_INTRO`: 10000ms (v2.4.0: extended for 5-act structure)
- `INTRO_SCREEN_DURATION`: 8000ms (4-act narrative journey)
- `BREATHING_CYCLE`: 4000ms (2s expand, 2s contract - used across Heartline and particles)
- All animation timings are centralized here for consistency

## Component Architecture

### Main Screen Components (`apps/mobile/src/components/aura/`)

**Background Layer:**
- `BlendedSky`: Dynamically blends weather/time gradients from both locations, includes:
  - Celestial bodies (sun/moon arcs tracking real sunrise/sunset)
  - Particle systems (ambient drift effects)
  - **Weather effects** (v2.4.0): Conditionally renders based on Open-Meteo weather codes:
    - `RainEffect`: Light/moderate/heavy rain with 15-40 particles
    - `SnowEffect`: Snowflakes with rotation and drift, 20-50 particles
    - `CloudEffect`: Drifting clouds using `expo-blur` (3-6 clouds)
    - `ThunderstormEffect`: Lightning flashes with random intervals (5-15s)

**Location Display:**
- `AuraGlobe`: Displays location info with weather icons, temperature, and sunrise/sunset (one at top, one at bottom)

**Connection Visualization:**
- `Heartline` (v2.4.0 - "Living Connection"): Central curved Bezier line showing:
  - Distance and time difference
  - **Breathing animation**: 4s cycle with opacity (0.3→0.7) and width (1→2) pulse
  - **Bidirectional particle flow**: Energy particles travel along curve (4-10 particles based on distance)
  - DST status and warnings (tap to show `TimeBridge`)
- `HeartlineParticles`: Manages bidirectional particle flow system with:
  - Bezier curve path following: Q(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
  - Color-coded particles based on day/night status
  - Dynamic count: <1000km=4, <5000km=6, <10000km=8, 10000km+=10
- `TimeBridge`: Modal with 24-hour timeline visualization comparing both locations' daily rhythms

**Setup Flow:**
- `IntroScreenRedesign` (v2.4.0): 8-second narrative journey with 4 acts:
  1. Two globes fly in from sides (cyan left, pink right)
  2. Aura Logo emerges with breathing glow
  3. Energy lines draw from globes to Logo
  4. Heartline preview forms
- `LocationInputScreen`: Handles city input with large pulsing marker (cyan/pink based on step)
- `ConnectionIntroRedesign` (v2.4.0): 10-second transition with 5 acts:
  1. Globes pulse in and breathe together
  2. World map emerges at actual coordinates (Mercator projection)
  3. City markers and names appear: "{City} ✦ {City}"
  4. Heartline draws between cities and begins breathing
  5. Smooth fade to main screen

**Settings:**
- `Settings`: Modal for viewing details, editing nicknames, and resetting locations (accessible via gear icon)

### Shared Package (`packages/shared/`)

**Services:**
- `geocodingService.ts`: City name ↔ coordinates via Nominatim (with 1s rate limiting)
- `weatherService.ts`: Fetches weather data from Open-Meteo

**Utils:**
- `calculateDistance()`: Haversine formula for distance between coordinates
- `calculateTimeDifference()`: Hours between two IANA timezones

## Common Development Issues

### Animations Not Playing
- **Cause**: Stale Metro Bundler cache
- **Solution**: `npx expo start -c`

### `Invariant Violation: RNSVGCircle` Error
- **Cause**: Multiple versions of `react-native-svg`
- **Solution**: Ensure it's only in `apps/mobile/package.json`, not root. Then clean reinstall.

### Reanimated Errors on Startup
- **Cause**: Incorrect initialization order
- **Solution**: Verify `index.ts` imports reanimated first, and `babel.config.js` has plugin last. Restart with `-c`.

### Time Difference Shows `NaNh`
- **Status**: Fixed in v2.1.0 using `Intl.DateTimeFormat` API
- **Solution**: If encountered, restart with cache clear (`npx expo start -c`)

### Reset App to See Intro Animations
**In-App Method (Recommended):**
1. Tap Settings icon (⚙️) on main screen
2. Scroll to bottom
3. Tap red "Reset Locations" button

**Developer Menu Method:**
1. Open dev menu: `Cmd+D` (iOS Simulator) / `Cmd+M` (Android)
2. Select "Clear AsyncStorage"
3. Reload app

## Development Philosophy

**When adding features:**
- Prioritize emotional impact over functional complexity
- Maintain minimalist aesthetic with generous whitespace
- Add subtle micro-interactions (pulsing, glowing) rather than jarring animations
- Follow the "Night to Dawn" narrative metaphor
- Test both setup flow and main experience after changes

**State management:**
- Location data persists across sessions via AsyncStorage
- Weather data is fetched fresh on each app launch
- Never commit changes that skip setup flow validation

## Dependencies to Note

**Mobile-Specific Critical Dependencies:**
- `react-native-reanimated: ~4.1.1` (requires special babel/import config)
- `react-native-svg: 15.12.1` (must be workspace-scoped, not root)
- `date-fns: ^4.1.0` and `date-fns-tz: ^3.2.0` (for DST logic)
- `zustand: 5.0.8` (with AsyncStorage middleware for persistence)

**Version Requirements:**
- Node.js: >=18.0.0
- npm: >=9.0.0
- Expo SDK: 54

## Attribution Requirements

Per API terms of service, the app should include attribution to:
- OpenStreetMap (for Nominatim geocoding)
- Open-Meteo (for weather data)

## Version 2.4.0 Design Philosophy (Bridging Worlds)

### Core Narrative: "From Separation to Unity"

Version 2.4.0 introduces a cohesive narrative thread that runs through the entire experience:

**Intro Screen** → **Connection Animation** → **Main Screen**
(Problem: Separation) → (Solution: Technology) → (Experience: Living Connection)

### Key Design Principles

1. **Continuous Visual Language**
   - Globes (cyan/pink) represent two people throughout all screens
   - Breathing rhythm (2-4s cycles) symbolizes "shared breath across the distance"
   - Color coding: Cyan=user, Pink=partner, maintained consistently

2. **From Static to Living**
   - Heartline transforms from static dashed line to breathing, particle-filled "living connection"
   - Weather effects make atmosphere tangible and dynamic
   - All connection elements pulse and flow, never fully static

3. **Emotional Resonance Over Functionality**
   - Particle count increases with distance (farther = stronger effort to connect)
   - Breathing animation creates meditative, calming rhythm
   - Weather effects immerse without distracting from core UI

4. **Storytelling Through Animation**
   - Each screen tells part of the story (4-act intro, 5-act connection)
   - Progressive narrative text guides emotional journey
   - Geographic accuracy (Mercator projection) grounds fantasy in reality

### Technical Guidelines for v2.4.0+

**When working with weather effects:**
- All effects must maintain 60fps on UI thread (use Reanimated v4)
- Effects should enhance, not obstruct main UI elements
- Use weather code ranges from Open-Meteo API (0-99)

**When working with Heartline/particles:**
- Always use Bezier curve math for particle paths
- Distance-based particle count ensures performance scales
- Breathing rhythm must sync across all "living" elements (4s cycle)

**When working with animations:**
- All timings defined in `Animations.ts` constants
- Use `withRepeat(-1, true)` for continuous breathing effects
- Use `Easing.inOut(Easing.sin)` for smooth, organic motion

### Design Documentation

Comprehensive design docs are available in `/docs/`:
- `HEARTLINE_DESIGN.md`: Living Heartline philosophy and implementation
- `INTRO_REDESIGN.md`: 4-act narrative structure and visual elements
- `CONNECTION_INTRO_REDESIGN.md`: 5-act bridge structure and continuity
