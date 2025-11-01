# Project Aura - AI Collaboration Guide

**Document Version:** 1.0
**Last Updated:** 2025-11-01

Welcome, AI assistant. This document provides the essential context for developing the Aura project. Please review it carefully before making changes.

---

## 1. Project Overview & Core Philosophy

Aura is a digital sanctuary for long-distance couples. It translates the real-time local weather and time of two individuals into a single, beautifully blended visual experience, allowing them to feel their partner's environment.

**Core Philosophy:**
- **Narrative First:** The user experience follows a "Night to Dawn" story arc, symbolizing the journey from separation to connection.
- **Emotion Over Function:** Design choices prioritize emotional resonance and poetry over sterile functionality.
- **Minimalist Aesthetics:** The UI is clean, spacious, and focuses on the blended sky visualization.
- **Micro-interactions Matter:** Subtle animations (pulsing, glowing) create a sense of life and polish.

---

## 2. Architecture & Tech Stack

Aura is a TypeScript monorepo with three main packages:

- `apps/mobile`: The React Native (Expo) mobile app. This is the primary focus of current development.
- `apps/web`: A React (Vite) web version.
- `packages/shared`: Shared business logic, types, and API services.

**Mobile Tech Stack:**
- **Framework:** React Native (Expo SDK 54)
- **State Management:** Zustand (with AsyncStorage for persistence)
- **Animation:** React Native Reanimated v4
- **Styling:** StyleSheet, `expo-linear-gradient`
- **APIs:**
    - **Open-Meteo:** Weather data (no key required).
    - **OpenStreetMap Nominatim:** Geocoding (no key required).

---

## 3. Application Flow & State

The initial app setup is controlled by a state machine in `App.tsx`.

**State Flow (`setupStep`):**
1.  `'intro'`: The user is shown the new, immersive `IntroScreen`.
2.  `'inputMy'`: The user inputs their location in the redesigned `LocationInputScreen`.
3.  `'inputPartner'`: The user inputs their partner's location.
4.  `'connecting'`: The `ConnectionIntro` animation plays.
5.  `'aligned'`: **(Currently Missing)** This screen should show after the connection animation.
6.  `'done'`: The main app experience is shown.

**State Management (Zustand):**
- `useLocationStore`: Persists user and partner location data (`myLocation`, `partnerLocation`).
- `useWeatherStore`: Manages weather data for both locations.

---

## 4. Current Development Status & Next Tasks

This section outlines the most recent changes and the immediate goals.

### ✅ Recently Completed

- **Complete Redesign of Onboarding:**
    - `apps/mobile/src/components/aura/IntroScreen.tsx`: A new, fully animated, immersive introduction screen.
    - `apps/mobile/src/components/aura/LocationInputScreen.tsx`: A new, minimalist, and aesthetically pleasing location input screen.
- **Refactoring of `App.tsx`:** The old, complex rendering logic has been replaced with clean, component-based rendering for each `setupStep`.

### 🎯 Priority Next Tasks

These are the highest-priority items to work on next, in order.

**1. Enhance `ConnectionIntro` Animation (Path Drawing)**
   - **Goal:** Implement the "Night to Dawn" narrative by adding the missing light stream path-drawing animation. The current animation is a placeholder.
   - **File:** `apps/mobile/src/components/aura/ConnectionIntro.tsx`
   - **Technical Brief:** Use `react-native-svg` and Reanimated's `useAnimatedProps` to animate the `stroke-dashoffset` of two `Path` elements, creating the effect of light streams traveling and meeting in the center.

**2. Implement the Missing `AlignedScreen`**
   - **Goal:** Create the `'aligned'` screen that should appear between the `'connecting'` and `'done'` steps.
   - **File:** Create `apps/mobile/src/components/aura/AlignedScreen.tsx`.
   - **Technical Brief:** This screen should display a message like "Your worlds are aligned," the two city names, and the `AuraLogo` with its own completion animation. It should have a button like "Enter Your Aura" that proceeds to the `'done'` step.

**3. Implement `AuraLogo` Ring Animation**
   - **Goal:** The two outer rings of the Aura logo should "draw" into existence.
   - **File:** `apps/mobile/src/components/aura/AuraLogo.tsx`
   - **Technical Brief:** This animation should be triggered on the new `AlignedScreen`. Use the same `stroke-dashoffset` technique as the path drawing, but on `Circle` elements within the SVG.

---

## 5. Key Component Deep Dive & Code Examples

### `ConnectionIntro` Path Drawing

The animation should follow a 6-second "Night to Dawn" narrative. The critical missing piece is the path drawing from **1s to 3s**.

**Implementation Snippet:**
'''typescript
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Inside your component...
const myPathLength = /* Calculate path length */;
const myPathProgress = useSharedValue(0); // Animate this from 0 to 1

// Animate stroke-dashoffset
const myPathAnimatedProps = useAnimatedProps(() => ({
  strokeDashoffset: myPathLength * (1 - myPathProgress.value),
}));

return (
  <Svg>
    <AnimatedPath
      d="M x1,y1 Q cx,cy x2,y2" // Use a Quadratic Bézier curve
      stroke="#06b6d4"
      strokeWidth={3}
      fill="none"
      strokeDasharray={myPathLength}
      animatedProps={myPathAnimatedProps}
    />
    {/* ... partner path ... */}
  </Svg>
);
'''

### `AuraLogo` Ring Drawing

This animation will be used on the `AlignedScreen`.

**Implementation Snippet:**
'''typescript
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Inside your component...
const circumference = 2 * Math.PI * 48; // r = 48
const ringProgress = useSharedValue(0); // Animate this from 0 to 1

const ringAnimatedProps = useAnimatedProps(() => ({
  strokeDashoffset: circumference * (1 - ringProgress.value),
}));

return (
  <Svg>
    <AnimatedCircle
      cx="50" cy="50" r="48"
      stroke="white"
      strokeWidth="1"
      fill="none"
      strokeDasharray={circumference}
      animatedProps={ringAnimatedProps}
    />
    {/* ... other logo parts ... */}
  </Svg>
);
'''

---

## 6. Common Commands

- **Install all dependencies:** `npm install`
- **Run the mobile app:** `npm run mobile`
- **Run the web app:** `npm run web`
- **Start mobile with clean cache:** `npm run mobile -- --clear` (or `cd apps/mobile && expo start -c`)