# Quick Start Guide

Get the Aura app running in minutes!

## 📱 Mobile App (iOS/Android)

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode and iOS Simulator
- For Android: Android Studio and Android Emulator

### Steps

1. **Navigate to mobile directory:**
   ```bash
   cd apps/mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   Or with clean cache:
   ```bash
   npm start -- --clear
   ```

4. **Choose platform:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

### Common Issues

If you see initialization errors:
```bash
# Clear all caches
rm -rf node_modules/.cache .expo
watchman watch-del-all  # If watchman is installed
npm start -- --clear
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

---

## 🌐 Web App

### Steps

1. **Navigate to web directory:**
   ```bash
   cd apps/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

---

## 🎯 First Time Setup

After the app loads:

1. **Enter your location:**
   - City name (e.g., "New York", "Tokyo", "London")
   - Must be a valid city recognized by OpenStreetMap

2. **Enter partner's location:**
   - Same format as above

3. **Enjoy the experience!**
   - See the beautiful blended sky
   - Watch the sun/moon move in real-time
   - Tap the center button to see detailed timeline

---

## 🔧 Development Commands

### Mobile

```bash
# Start with clean cache
npm start -- --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Type checking
npx tsc --noEmit

# Check for issues
npx expo doctor
```

### Web

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Root (Monorepo)

```bash
# Install all dependencies
npm install

# Clean all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

---

## 📚 Documentation

- **Implementation Details:** [MOBILE_WEB_SYNC.md](./MOBILE_WEB_SYNC.md)
- **Version History:** [CHANGELOG.md](./CHANGELOG.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🎨 Features Overview

### Mobile App v2.0.0

- ✅ **Animated Intro:** 3-second connection animation with logo
- ✅ **Blended Sky:** Smooth gradient blending between two weather states
- ✅ **Celestial Bodies:** Sun/moon that move based on real time
- ✅ **Particle Effects:** Ambient drifting particles
- ✅ **Location Panels:** Detailed weather and time information
- ✅ **Interactive Timeline:** 24-hour day/night visualization
- ✅ **Live Updates:** Real-time weather data from Open-Meteo API

### Web App v1.0.0

- ✅ All mobile features
- ✅ Additional CSS animations
- ✅ More particles (20+ vs 8 on mobile)
- ✅ Advanced weather visualizations

---

## 🚀 Quick Tips

1. **Performance:**
   - On older devices, reduce particle count in `apps/mobile/src/constants/Animations.ts`
   - Change `COUNT: 8` to `COUNT: 4`

2. **Testing:**
   - Test on real devices for accurate performance
   - Simulators may not reflect actual behavior

3. **Weather Updates:**
   - Tap refresh button to update weather
   - Data refreshes automatically on app restart

4. **Locations:**
   - Use city names, not coordinates
   - Be specific: "New York City" vs "NYC"
   - Reset in Settings if needed

---

## 🆘 Need Help?

1. **Check console logs** for error messages
2. **Try clearing caches** (see commands above)
3. **Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**
4. **Check TypeScript:** `npx tsc --noEmit`
5. **Verify dependencies:** `npm ls`

---

## 🎉 You're All Set!

The app should now be running with all animations and effects working perfectly!

**Mobile:** Beautiful blended skies with celestial animations
**Web:** Rich atmospheric experience with full particle effects

Enjoy connecting worlds! 🌍✨
