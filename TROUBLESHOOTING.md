# Troubleshooting Guide

This document contains solutions to common issues you might encounter with the Aura app.

## Mobile App Issues

### 1. SVG Component Registration Error

**Error Message:**
```
ERROR [runtime not ready]: Invariant Violation: Tried to register two views with the same name RNSVGCircle
```

**Cause:**
Multiple versions of `react-native-svg` are installed, causing duplicate component registration. This typically happens when dependencies have different version requirements.

**Solution:**

1. **Check for duplicate versions:**
   ```bash
   cd apps/mobile
   npm ls react-native-svg
   ```

2. **If you see multiple versions, update package.json:**
   ```json
   {
     "dependencies": {
       "react-native-svg": "15.14.0"  // Use the latest version
     }
   }
   ```

3. **Clean install:**
   ```bash
   cd apps/mobile
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Verify single version:**
   ```bash
   npm ls react-native-svg
   ```
   You should see `deduped` next to nested dependencies.

5. **Clear Metro bundler cache:**
   ```bash
   npm start -- --clear
   ```

**Status:** ✅ Fixed in v2.0.0 - Updated to unified SVG version 15.14.0

---

### 2. Reanimated Initialization Errors

**Error Messages:**
```
ERROR  ExceptionsManager should be set up after React DevTools to avoid console.error arguments mutation
ERROR  [TypeError: property is not writable]
ERROR  [TypeError: Cannot read property 'default' of undefined]
```

**Cause:**
React Native Reanimated is not properly initialized at app startup.

**Solution:**

1. **Ensure Reanimated is imported first in `index.ts`:**
   ```typescript
   // apps/mobile/index.ts
   import 'react-native-reanimated'; // MUST be first
   import { registerRootComponent } from 'expo';
   import App from './App';

   registerRootComponent(App);
   ```

2. **Check `babel.config.js`:**
   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: ['react-native-reanimated/plugin'], // Must be last
     };
   };
   ```

3. **Important:**
   - The Reanimated import MUST be the first import in your entry file
   - The Reanimated plugin MUST be the last item in the plugins array

4. **Clear cache and restart:**
   ```bash
   rm -rf node_modules/.cache .expo
   watchman watch-del-all  # If watchman is installed
   npm start -- --clear
   ```

**Status:** ✅ Fixed in v2.0.0

---

### 3. Metro Bundler Cache Issues

**Symptoms:**
- Old code still running after changes
- Unexpected errors after installing packages
- Components not updating

**Solution:**

1. **Clear Metro cache:**
   ```bash
   cd apps/mobile
   npm start -- --clear
   ```

2. **Or manually clear cache:**
   ```bash
   rm -rf node_modules/.cache
   watchman watch-del-all  # If watchman is installed
   ```

3. **For stubborn issues:**
   ```bash
   rm -rf node_modules
   npm install
   npm start -- --clear
   ```

---

### 4. iOS Build Issues

**Symptoms:**
- Pods installation fails
- Build errors in Xcode

**Solution:**

1. **Clear iOS build cache:**
   ```bash
   cd apps/mobile/ios
   rm -rf Pods Podfile.lock
   pod install
   ```

2. **Clean Xcode build:**
   - Open Xcode
   - Product → Clean Build Folder (Cmd+Shift+K)

3. **Reinstall dependencies:**
   ```bash
   cd apps/mobile
   npx expo prebuild --clean
   ```

---

### 5. Android Build Issues

**Symptoms:**
- Gradle build fails
- Dependencies not resolving

**Solution:**

1. **Clean Gradle cache:**
   ```bash
   cd apps/mobile/android
   ./gradlew clean
   ```

2. **Clear Gradle cache completely:**
   ```bash
   rm -rf ~/.gradle/caches/
   ```

3. **Rebuild:**
   ```bash
   cd apps/mobile
   npx expo run:android
   ```

---

### 6. Animation Performance Issues

**Symptoms:**
- Laggy animations
- Choppy particle effects
- App becomes slow

**Solution:**

1. **Reduce particle count in `/apps/mobile/src/constants/Animations.ts`:**
   ```typescript
   export const PARTICLE_CONFIG = {
     COUNT: 4, // Reduce from 8 to 4 for older devices
     // ...
   };
   ```

2. **Disable some animations for older devices:**
   ```typescript
   // In ConnectionIntro.tsx, reduce star count
   const stars = useMemo(
     () => generateStars(25, SCREEN_WIDTH, SCREEN_HEIGHT), // Reduce from 50
     []
   );
   ```

3. **Enable native driver where possible:**
   - All transform and opacity animations should use native driver
   - Check that animations use `useNativeDriver: true` where supported

---

### 7. Weather Data Not Loading

**Symptoms:**
- Locations load but weather stays blank
- Error: "Failed to fetch weather data"

**Solution:**

1. **Check internet connection:**
   - Ensure device has active internet
   - Try opening a browser

2. **Check API endpoints:**
   - Open-Meteo API might be temporarily down
   - Check status at https://open-meteo.com

3. **Check location data:**
   - In Settings, reset locations
   - Re-enter city names
   - Ensure city names are spelled correctly

4. **Debug mode:**
   ```typescript
   // In shared/services/weatherService.ts
   console.log('Fetching weather for:', latitude, longitude);
   ```

---

### 8. Location Search Not Working

**Symptoms:**
- "City not found" errors
- Location input doesn't respond

**Solution:**

1. **Check geocoding service:**
   - Nominatim API might be rate-limited
   - Wait a few seconds between searches

2. **Try alternative city names:**
   ```
   Instead of: NYC
   Try: New York City

   Instead of: LA
   Try: Los Angeles
   ```

3. **Check network logs:**
   - Enable Chrome DevTools for debugging
   - Look for failed network requests

---

### 9. State Persistence Issues

**Symptoms:**
- Locations not saved between app restarts
- Weather data resets

**Solution:**

1. **Clear AsyncStorage:**
   ```typescript
   // In React Native Debugger or dev tools
   import AsyncStorage from '@react-native-async-storage/async-storage';
   AsyncStorage.clear();
   ```

2. **Check Zustand persist config:**
   - Verify store configuration in `/apps/mobile/src/stores/`
   - Ensure AsyncStorage is properly configured

3. **Reinstall app:**
   - Delete app from device
   - Rebuild and install fresh

---

### 10. TypeScript Errors

**Symptoms:**
- Type errors in IDE
- Build fails due to type mismatches

**Solution:**

1. **Regenerate types:**
   ```bash
   cd apps/mobile
   npx tsc --noEmit
   ```

2. **Check shared package types:**
   ```bash
   cd packages/shared
   npm run build  # If build script exists
   ```

3. **Update TypeScript:**
   ```bash
   cd apps/mobile
   npm install typescript@latest --save-dev
   ```

---

## Web App Issues

### 1. Vite Dev Server Issues

**Solution:**
```bash
cd apps/web
rm -rf node_modules .vite
npm install
npm run dev
```

### 2. CSS Not Loading

**Solution:**
- Check that Tailwind CDN is loading
- Verify `index.html` includes Tailwind script
- Clear browser cache

---

## Monorepo Issues

### 1. Duplicate Dependencies in Workspaces

**Error from `npx expo-doctor`:**
```
✖ Check that no duplicate dependencies are installed
Found duplicates for react
Found duplicates for react-native
Found duplicates for react-native-svg
```

**Cause:**
In a monorepo setup, dependencies installed at the root level can conflict with workspace-specific dependencies.

**Solution:**

1. **Remove native dependencies from root `package.json`:**
   ```json
   // ❌ DON'T install React Native packages at root
   {
     "dependencies": {
       "react-native-svg": "15.12.1"  // Remove this
     }
   }
   ```

2. **Keep only dev dependencies at root:**
   ```json
   {
     "devDependencies": {
       "typescript": "^5.8.0"  // This is OK
     }
   }
   ```

3. **Clean reinstall:**
   ```bash
   # From repository root
   rm -rf node_modules package-lock.json
   rm -rf apps/mobile/node_modules apps/mobile/package-lock.json
   npm install
   cd apps/mobile && npm install
   ```

4. **Verify with Expo doctor:**
   ```bash
   cd apps/mobile
   npx expo-doctor
   ```

**Status:** ✅ Fixed - All checks pass (17/17)

---

## Shared Package Issues

### 1. Module Not Found Errors

**Symptoms:**
```
Cannot find module '@aura/shared'
```

**Solution:**

1. **Rebuild shared package:**
   ```bash
   cd packages/shared
   npm install
   ```

2. **Link packages in monorepo:**
   ```bash
   cd root
   npm install
   ```

3. **Verify imports:**
   ```typescript
   // Correct
   import { LocationData } from '@aura/shared';

   // Incorrect
   import { LocationData } from 'shared';
   ```

---

## General Tips

### Development Best Practices

1. **Always clear cache after installing packages:**
   ```bash
   npm start -- --clear
   ```

2. **Use TypeScript strict mode:**
   - Catches errors early
   - Better IDE support

3. **Monitor bundle size:**
   - Use Expo's production build to check size
   - Remove unused dependencies

4. **Test on real devices:**
   - Simulators don't reflect real performance
   - Test on both iOS and Android

### Performance Monitoring

1. **Use React DevTools Profiler:**
   - Identify slow renders
   - Optimize heavy components

2. **Monitor memory usage:**
   - Check for memory leaks
   - Ensure animations are cleaned up

3. **Use native driver for animations:**
   - Much better performance
   - Animations run on UI thread

---

## Getting Help

### Before Asking for Help

1. **Check console logs:**
   - Look for error messages
   - Note the full error stack trace

2. **Reproduce the issue:**
   - Document steps to reproduce
   - Note any error messages

3. **Check this troubleshooting guide:**
   - Search for similar issues
   - Try suggested solutions

### Reporting Bugs

When reporting bugs, include:

1. **Environment:**
   - OS version (iOS/Android version)
   - Device model
   - App version
   - React Native version

2. **Steps to reproduce:**
   - Detailed steps
   - Expected vs actual behavior

3. **Error logs:**
   - Full error messages
   - Console logs
   - Screenshots if applicable

4. **Code samples:**
   - Relevant code snippets
   - Configuration files

---

## Quick Reference

### Common Commands

```bash
# Start mobile app with clean cache
cd apps/mobile && npm start -- --clear

# Start web app
cd apps/web && npm run dev

# Reinstall all dependencies (from root)
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Check for duplicate dependencies
cd apps/mobile && npm ls <package-name>

# Update all packages
npx expo install --check
```

### File Locations

- **Mobile animations:** `/apps/mobile/src/constants/Animations.ts`
- **Mobile components:** `/apps/mobile/src/components/aura/`
- **Shared utilities:** `/packages/shared/`
- **Configuration files:**
  - `apps/mobile/babel.config.js`
  - `apps/mobile/app.json`
  - `apps/mobile/package.json`

---

**Last Updated:** 2025-11-01
**Version:** 2.0.0

For more detailed implementation notes, see [MOBILE_WEB_SYNC.md](./MOBILE_WEB_SYNC.md)
