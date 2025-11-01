# Troubleshooting Guide

This guide provides solutions to common issues for the Aura mobile app, from animation glitches to build errors.

---

## 🎬 Animation & UI Issues

### How to Reset the App to See the Intro Animations

If you have already set your locations, the app will skip the intro. To see the full animation flow again, you must reset the app state.

**Recommended Method: In-App Settings**

1.  On the main screen, tap the **Settings icon** (⚙️) in the top-left corner.
2.  Scroll to the bottom.
3.  Tap the red **"Reset Locations"** button and confirm.
4.  The app will immediately return to the welcome screen.

**Alternative Method: Developer Menu**

1.  Open the developer menu:
    *   **iOS Simulator:** `Cmd + D`
    *   **Android Emulator:** `Cmd + M`
    *   **Physical Device:** Shake the device.
2.  Select **"Clear AsyncStorage"**.
3.  Reload the app (from the same menu, select "Reload").

### Onboarding Animation Flow Checklist

After a reset, you should see the following sequence:

1.  **IntroScreen:** Immersive starry sky with animated logo and text.
2.  **LocationInputScreen (You):** After pressing "Weave Your Connection", a large cyan marker appears with a pulse animation.
3.  **LocationInputScreen (Partner):** After submitting your location, a large pink marker appears for your partner's location.
4.  **ConnectionIntro:** After submitting the second location, the full-screen "Night to Dawn" connection animation plays.
5.  **MainScreen:** The app transitions to the main blended sky experience.

### Issue: Animations are not playing or are stuck

- **Cause:** This is often due to a stale Metro Bundler cache.
- **Solution:** Quit the current process (`Ctrl+C`) and restart the server with a clean cache.

  ```bash
  # From the /apps/mobile directory
  npx expo start -c
  ```

--- 

## ⚙️ Build, Cache, and Dependency Errors

### Understanding `expo start -c`

The `-c` or `--clear` flag is crucial for troubleshooting. However, it's important to know what it does and doesn't do:

- ✅ **It clears:** The Metro Bundler cache (your app's bundled JavaScript).
- ❌ **It does NOT clear:** `AsyncStorage` (your saved locations and app state).

**Rule of thumb:** Use `expo start -c` after installing or updating packages, or when code changes don't appear to be loading.

### Error: `Invariant Violation: Tried to register two views with the same name RNSVGCircle`

- **Cause:** Multiple, conflicting versions of `react-native-svg` are installed in the monorepo.
- **Solution:** Ensure `react-native-svg` is defined **only** in `apps/mobile/package.json` and not in the root `package.json`. Then, perform a clean reinstall:

  ```bash
  # From the project root
  rm -rf node_modules apps/mobile/node_modules
  npm install
  ```

### Error: Reanimated errors on startup (e.g., `property is not writable`)

- **Cause:** React Native Reanimated is not initialized correctly.
- **Solution:** Check two files in `apps/mobile`:
    1.  **`index.ts`**: The import `import 'react-native-reanimated';` **must be the very first line**.
    2.  **`babel.config.js`**: The plugin `'react-native-reanimated/plugin'` **must be the last item** in the `plugins` array.

    After verifying, restart with a clean cache: `npx expo start -c`.

### Issue: `npx expo-doctor` shows duplicate dependencies

- **Cause:** A dependency (like `react` or `react-native`) is installed both at the project root and in a workspace (`apps/mobile`), which is incompatible with Expo.
- **Solution:** Edit the root `package.json` to move the conflicting dependency to `devDependencies` or remove it if it's only needed in the workspace. Then, perform a clean reinstall.

--- 

## 🌐 Data & API Issues

### Issue: Weather or location data is not loading

1.  **Check Internet Connection:** Ensure your device or simulator has network access.
2.  **Check API Status:** The Open-Meteo or Nominatim APIs might be temporarily down.
3.  **Rate Limiting:** The Nominatim API has a rate limit of 1 request per second. If you search for cities too quickly, you may get temporarily blocked.
4.  **Invalid City Name:** Ensure you are using a valid, recognized city name (e.g., "New York City" instead of "NYC").

### Issue: Time difference shows `NaNh`

- **Cause:** This was a bug in older versions where `Date.toLocaleString()` behaved inconsistently in the React Native environment.
- **Status:** ✅ **Fixed.** The logic now uses the cross-platform reliable `Intl.DateTimeFormat` API.
- **Solution:** If you still encounter this, it is a caching issue. Restart with `npx expo start -c`.

--- 

## 🛠️ General Development Workflow

- **For normal development:**
  ```bash
  cd apps/mobile
  npx expo start
  ```

- **After installing or updating packages:**
  ```bash
  cd apps/mobile
  npx expo start -c
  ```

- **For a complete, fresh start (the "nuke" option):**
  ```bash
  # From the project root
  rm -rf node_modules apps/*/node_modules packages/*/node_modules
  npm install
  cd apps/mobile
  npx expo start -c
  ```
  Then, use the in-app "Reset Locations" button.