# App Icons Configuration

This document describes the app icon setup for Aura.

## Source Logo

The master logo file is located at:
```
apps/mobile/assets/AuraLogo.svg
```

This SVG features the Aura gradient (yellow → pink → purple → blue) with a glowing center, representing the "Night to Dawn" narrative.

## Generated Icons

All app icons are automatically generated from `AuraLogo.svg` using the following script:

```bash
node scripts/generate-icons.js
```

### Icon Specifications

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | iOS and Android app icon |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon (foreground) |
| `splash-icon.png` | 512×512 | Splash screen logo |
| `favicon.png` | 48×48 | Web favicon |

## Configuration

Icons are configured in `apps/mobile/app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#1e1b4b"
    },
    "ios": {
      "bundleIdentifier": "com.aura.ambianceshare"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e1b4b"
      },
      "package": "com.aura.ambianceshare"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Background Color

The splash screen and adaptive icon background use `#1e1b4b` (deep indigo), which aligns with Aura's "Night to Dawn" theme and provides optimal contrast for the gradient logo.

## Regenerating Icons

If you need to update the logo design:

1. Edit `apps/mobile/assets/AuraLogo.svg`
2. Run the generation script:
   ```bash
   npm run generate-icons
   ```
   or
   ```bash
   node scripts/generate-icons.js
   ```
3. Clear Expo cache and restart:
   ```bash
   npm run mobile -- --clear
   ```

## Dependencies

Icon generation requires:
- `sharp` (installed as dev dependency)

## Notes

- All icons are generated from the single source SVG to maintain consistency
- The SVG uses a gradient that symbolizes the emotional journey from separation (night) to connection (dawn)
- Icons follow Expo's recommended sizes and formats
- The adaptive icon background ensures the logo is visible on any Android launcher theme
