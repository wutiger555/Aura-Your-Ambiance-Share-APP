# npm vs expo Commands - What's the Difference?

## Understanding the Command Structure

### `npm start` vs `expo start`

Both commands do the same thing - they start the Metro bundler for your React Native app. However:

- **`npm start`** - Runs the `start` script defined in your `package.json`
  - In Expo projects, this typically runs `expo start` internally
  - It's a wrapper that calls the Expo CLI

- **`expo start`** - Directly invokes the Expo CLI
  - More direct access to Expo-specific flags and options
  - Recommended for Expo projects

### The `--clear` Flag

**IMPORTANT**: The `--clear` flag only clears the **Metro bundler cache**, NOT your app's data!

```bash
npm start -- --clear     # ❌ Clears Metro cache only
expo start --clear       # ❌ Clears Metro cache only
```

What `--clear` does:
- ✅ Clears JavaScript bundle cache
- ✅ Clears Metro bundler cache
- ✅ Forces fresh bundling of your code
- ❌ Does NOT clear AsyncStorage
- ❌ Does NOT clear app state/data
- ❌ Does NOT reset locations

## How to Actually Reset Your App

### Method 1: Use the Settings Button (Recommended) ✅

1. Tap the **Settings button** (top-left corner)
2. Scroll down to **"Reset Locations"**
3. Confirm the reset
4. The app will return to the welcome flow with star animations

This properly clears:
- ✅ Location data
- ✅ AsyncStorage
- ✅ Weather data
- ✅ All app state

### Method 2: Expo Developer Menu

1. Shake your device (or press Cmd+D in iOS Simulator)
2. Select **"Clear AsyncStorage"**
3. Reload the app (shake again → "Reload")

### Method 3: Reinstall the App (Nuclear Option)

```bash
# Stop the app
# Delete the app from your device/simulator
# Then rebuild and run
cd apps/mobile
expo start
# Press 'i' for iOS or 'a' for Android
```

## Command Comparison

| Command | What It Does | Use Case |
|---------|--------------|----------|
| `npm start` | Starts Expo via npm script | General use |
| `expo start` | Starts Expo directly | Recommended for Expo projects |
| `npm start -- --clear` | Clears Metro cache, starts app | After package updates |
| `expo start --clear` | Clears Metro cache, starts app | Same as above, more direct |
| `expo start -c` | Same as `--clear` | Shorthand version |

## Why Your Setup Flow Wasn't Showing

When you ran `npm start -- --clear`, the Metro bundler cache was cleared, but your location data was still stored in AsyncStorage. The app loaded this data and went straight to the main page.

**The fix**: Use the Settings → Reset Locations button, which properly calls `clearLocations()` to remove data from AsyncStorage.

## Recommended Workflow

### For Normal Development
```bash
cd apps/mobile
expo start
```

### After Installing New Packages
```bash
cd apps/mobile
expo start --clear
```

### To See Welcome Animations Again
1. Use Settings → Reset Locations in the app
2. OR shake device → Clear AsyncStorage → Reload

### For Complete Fresh Start
```bash
cd apps/mobile
rm -rf node_modules
npm install
expo start --clear
# Then use Settings → Reset Locations in the app
```

## The Double Dash in `npm start -- --clear`

The `--` tells npm to pass everything after it to the underlying command:

```bash
npm start -- --clear
#         ↑↑  ↑↑
#         ||  ||
#         ||  └└─ Flags for expo start
#         └└───── Separator
```

With Expo, you can skip the npm wrapper:
```bash
expo start --clear  # ✅ Cleaner, more direct
```

## Quick Reference

| Goal | Command |
|------|---------|
| Start app normally | `expo start` |
| Clear bundle cache | `expo start -c` |
| Reset to welcome screen | Use Settings button in app |
| Complete fresh start | Delete app + reinstall |

---

**Remember**: To see the welcome flow with star animations, you must **clear AsyncStorage**, not just the Metro cache!
