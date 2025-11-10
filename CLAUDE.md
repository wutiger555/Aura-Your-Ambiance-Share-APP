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

### Starting the Mobile App

**CRITICAL: Always use double dash (`--`) to pass flags from root to workspace!**

```bash
# Normal development start (from project root)
npm run mobile

# Clear cache and start (CORRECT - use double dash with space)
npm run mobile -- -c
# ✅ Correct: npm run mobile -- -c
# ❌ Wrong:   npm run mobile --c  (flag doesn't reach expo!)

# Alternative: Run from mobile directory
cd apps/mobile
npx expo start -c
```

### When to Clear Cache

**You MUST clear cache when:**
- ✅ After installing/updating packages
- ✅ When animations don't play
- ✅ When code changes don't appear
- ✅ When Logo/SVG components don't render
- ✅ After switching git branches

**Clearing cache does NOT:**
- ❌ Clear AsyncStorage (saved locations, settings persist)
- ❌ Require reinstalling node_modules

### Other Commands

```bash
# Install dependencies for all workspaces
npm install

# Run web app
npm run web

# Type check all workspaces
npm run type-check

# Complete clean reinstall ("nuke" option - last resort)
npm run clean
npm install
cd apps/mobile && npx expo start -c

# Check for dependency issues
cd apps/mobile && npx expo-doctor
```

### Troubleshooting Cache Issues

If `npm run mobile -- -c` doesn't work:

```bash
# Method 1: Manual cache clear
cd apps/mobile
rm -rf .expo
rm -rf node_modules/.cache
npx expo start

# Method 2: Complete Metro Bundler reset
cd apps/mobile
watchman watch-del-all  # If watchman is installed
npx expo start -c

# Method 3: Full workspace reinstall
cd /home/user/Aura-Your-Ambiance-Share-APP
npm run clean
npm install
npm run mobile -- -c
```

## Application Flow & State Management

### Setup Flow State Machine (`App.tsx`) - v2.5.0

The app follows a sequential setup flow controlled by `setupStep`:

1. **`'intro'`**: Immersive `IntroScreenRedesign` (8-second narrative journey)
   - 4-act structure: Two globes appear → Aura Logo emerges → Energy lines connect → Heartline preview
   - Narrative: "Two people." → "Different skies." → "One shared atmosphere."
2. **`'coupleSetup'`**: NEW - `CoupleSetupScreen` collects relationship information
   - Couple names (e.g., "Tzu-Hui" and "Alex")
   - Optional emojis (e.g., 🌸 and 🌙)
   - Optional relationship start date
   - Optional next meeting date
3. **`'inputMy'`**: User inputs their location in `LocationInputScreen` (cyan marker with pulse)
4. **`'inputPartner'`**: User inputs partner's location (pink marker)
5. **`'connecting'`**: Full-screen `ConnectionIntroRedesign` animation (10 seconds)
   - 5-act structure: Globes pulse → Breathe → Map emerges → Heartline forms → Fade to main
   - Shows actual city names: "{City} ✦ {City}"
6. **`'done'`**: Main blended sky experience with personalized displays and living Heartline

### Zustand State Stores

**`useLocationStore`** (persisted to AsyncStorage):
- Stores `myLocation` and `partnerLocation` (type: `LocationData`)
- **v2.5.0**: Stores `coupleProfile` (type: `CoupleProfile`)
- **v2.5.0**: Stores `mySchedule` and `partnerSchedule` (type: `DailySchedule`)
- Sets `hasSetup: true` only when both locations are present
- Methods:
  - `setCoupleProfile()` - Store couple personalization
  - `updateStatusMessage()` - Update location status messages
  - `updateMilestoneDates()` - Update relationship dates
  - `updateNicknames()` - Update location nicknames
  - `setSchedules()` - Store daily schedules
  - `clearLocations()` - Reset all data

**`useWeatherStore`** (in-memory only):
- Stores `myWeather` and `partnerWeather` (type: `WeatherData`)
- Manages `isLoading` and `error` states
- Weather data is fetched fresh when app reaches `'done'` state

**`useMessageStore`** (v2.5.0, persisted to AsyncStorage):
- Stores array of `Message` objects
- Methods:
  - `addMessage()` - Add new message with timestamp
  - `deleteMessage()` - Remove message by ID
- Used for local note/message system

### Key Data Types (`packages/shared/types/index.ts`)

```typescript
LocationData {
  name: string;
  latitude: number;
  longitude: number;
  nickname?: string;
  statusMessage?: string; // v2.5.0: Editable status
}

CoupleProfile { // v2.5.0: NEW
  myName: string;
  partnerName: string;
  myEmoji?: string;
  partnerEmoji?: string;
  relationshipStart?: string; // ISO date
  nextMeetingDate?: string;   // ISO date
  lastMetDate?: string;        // ISO date
}

DailySchedule { // v2.4.0
  sleep: { start: number; end: number }; // 0-24 hours
  work: { start: number; end: number } | null;
  busy: { start: number; end: number }[];
}

Message { // v2.5.0: NEW
  id: string;
  content: string;
  createdAt: string; // ISO datetime
  isFromMe: boolean;
  emoji?: string;
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
- `AuraGlobe` (v2.5.0 enhanced): Displays location info with personalization
  - Shows name + emoji (e.g., "🌸 Tzu-Hui")
  - Weather icons, temperature, time
  - Editable status messages (tap to edit)
  - Sunrise/sunset times
  - One at top, one at bottom

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
- **`ConnectionWidget`** (v2.5.0): Compact 64x64 circular heart button at bottom-right
  - Breathing animation for visual appeal
  - Entry point to "Your Connection" settings
  - Replaces old message button

**Personalization Components (v2.5.0):**
- `CoupleSetupScreen`: Initial setup for collecting couple information
  - Names, emojis, relationship dates
  - Appears after intro, before location input
- `RelationshipMilestone`: Shows relationship stats
  - "Together for X days" counter
  - "Next reunion in X days" countdown
- `StatusEditModal`: Edit personal status messages
- `MilestoneEditModal`: Edit relationship dates
- `WeatherReminderCard`: Context-aware weather notifications
- `MessageCenter`: Local message/note system

**Daily Schedule (v2.4.0/v2.5.0 enhanced):**
- `DailyRhythmEditor`: Schedule comparison and editing
  - **Dual-column layout** (v2.5.0): Side-by-side schedule cards
  - Editable time fields with Alert.prompt
  - Quick template selection (Student, Office, Night Owl, Early Bird, Flexible)
  - **Three-row timeline**: Your activities, partner's activities, overlapping free time (green)
  - "Best Times for Video Calls & Chatting" section

**Setup Flow:**
- `IntroScreenRedesign` (v2.4.0): 8-second narrative journey with 4 acts:
  1. Two globes fly in from sides (cyan left, pink right)
  2. Aura Logo emerges with breathing glow
  3. Energy lines draw from globes to Logo
  4. Heartline preview forms
- **`CoupleSetupScreen`** (v2.5.0): Collect couple information
  - Names, emojis, relationship dates
  - Optional fields don't block flow
- `LocationInputScreen`: Handles city input with large pulsing marker (cyan/pink based on step)
- `ConnectionIntroRedesign` (v2.4.0): 10-second transition with 5 acts:
  1. Globes pulse in and breathe together
  2. World map emerges at actual coordinates (Mercator projection)
  3. City markers and names appear: "{City} ✦ {City}"
  4. Heartline draws between cities and begins breathing
  5. Smooth fade to main screen

**Settings:**
- `Settings`: Comprehensive modal for managing connection
  - Visual world map with flight path animation
  - Distance, flight time, airport codes
  - Best call time (schedule-aware if schedules set)
  - CO₂ emissions estimate
  - Location nickname editing
  - Daily rhythm editor access
  - Reset connection option

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
