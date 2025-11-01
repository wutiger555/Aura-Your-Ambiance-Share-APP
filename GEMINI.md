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

### ✅ Recently Completed (v2.1.0)

- **Robust DST Handling:** Implemented a definitive, user-centric Daylight Saving Time feature.
  - **Replaced** all manual DST logic with the `date-fns` and `date-fns-tz` libraries for accuracy and reliability.
  - **Centralized** all DST information in the `Heartline` component. It now displays a detailed, yellow warning for imminent transitions (including same-day) and a simple, white timezone abbreviation status otherwise.
  - **Fixed** all related crashes (`TypeError`, `ReferenceError`) and UI bugs.
- **Animation Pacing:** Tuned the `ConnectionIntro` animation to the user's preferred 8-second duration, while keeping a longer, more readable pause for the title text.
- **UI & Logic Integrity:** Corrected a critical layout bug that caused the main UI to disappear and fixed numerous other issues related to scrolling, time calculation, and input flow.

### 🎯 Priority Next Tasks

- The backlog is currently clear. Awaiting next user request.

---

## 5. Key Component Deep Dive & Code Examples

### `dstUtils.ts` (Powered by `date-fns-tz`)

This utility has been completely refactored to use the `date-fns-tz` library. It no longer contains fragile, manual date math. The core logic now revolves around a new, self-contained `isDaylightSavingTime` function that leverages `getTimezoneOffset` from the library to reliably determine DST status. This fixed all bugs related to detecting transitions, especially same-day changes.

### `Heartline.tsx` (DST Information Hub)

This component is now the single source of truth for the user regarding DST. It contains a `useMemo` hook that calls `getDSTInfo` and formats a status string. This string is conditionally styled (yellow for warnings, white for standard status) and always present, providing clear, context-aware information without cluttering the UI.

### `Settings.tsx`

This component now correctly imports and uses the `formatUTCOffset` function from the definitive `dstUtils.ts` to display timezone information, resolving all previous crashes.

---

## 6. Common Commands

- **Install all dependencies:** `npm install`
- **Run the mobile app:** `npm run mobile`
- **Run the web app:** `npm run web`
- **Start mobile with clean cache:** `npm run mobile -- --clear` (or `cd apps/mobile && expo start -c`)