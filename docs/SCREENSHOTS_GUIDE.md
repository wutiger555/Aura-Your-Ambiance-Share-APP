# Screenshot Guide for Aura

This guide will help you capture professional screenshots for the GitHub README and app store listings.

## 📸 Recommended Screenshots

### Essential Captures (Priority Order)

1. **Main Blended Sky Screen** ⭐⭐⭐
   - Shows the core experience
   - Capture during different times of day
   - Include various weather effects

2. **Intro Screen Sequence** ⭐⭐⭐
   - The 4-act narrative journey
   - Capture key moments: globes appearing, logo emerging, heartline forming

3. **Connection Animation** ⭐⭐
   - World map view with city markers
   - Heartline drawing between locations
   - Shows geographic accuracy

4. **Couple Setup Screen** ⭐⭐
   - Name and emoji selection
   - Milestone date setting
   - First-time user experience

5. **Daily Rhythm Editor** ⭐⭐
   - Side-by-side schedule comparison
   - Timeline with overlapping free time
   - "Best Times for Calls" section

6. **Settings Modal** ⭐
   - World map with flight path
   - Connection statistics
   - Distance and time info

7. **Time Bridge** ⭐
   - 24-hour timeline comparison
   - Sunrise/sunset indicators
   - Current time markers

## 🎨 Screenshot Composition Tips

### Device Framing

Use device mockups for professional look:
- **iOS**: iPhone 14 Pro or iPhone 15 Pro (latest)
- **Android**: Pixel 7 or Samsung Galaxy S23

**Free mockup tools:**
- [Mockuphone.com](https://mockuphone.com/)
- [Shotsnapp.com](https://shotsnapp.com/)
- [Smartmockups.com](https://smartmockups.com/) (has free tier)

### Capture Settings

**Resolution:**
- iOS Simulator: Retina display (2x or 3x)
- Android Emulator: 1080×1920 minimum
- Export as PNG for best quality

**Time of Day Variations:**
Capture main screen at different times to show:
- Morning (sunrise colors)
- Midday (bright sun)
- Evening (sunset gradient)
- Night (moon and stars)

### Weather Variations

Show different weather effects:
- ☀️ Clear/Sunny
- ☁️ Cloudy
- 🌧️ Rainy
- ❄️ Snowy
- ⚡ Thunderstorm

## 📱 How to Capture Screenshots

### iOS Simulator

```bash
# Start the app
npm run mobile
# Press 'i' for iOS simulator

# Take screenshot
# Method 1: Cmd + S (saves to Desktop)
# Method 2: Use Xcode's screenshot tool
# Method 3: Use macOS Screenshot utility (Cmd + Shift + 5)
```

### Android Emulator

```bash
# Start the app
npm run mobile
# Press 'a' for Android emulator

# Take screenshot
# Click the camera icon in emulator toolbar
# Or use Cmd + S (Mac) / Ctrl + S (Windows)
```

### Physical Device (Expo Go)

```bash
# Start the app
npm run mobile
# Scan QR code with Expo Go

# Take screenshot
# iOS: Volume Up + Side Button
# Android: Volume Down + Power Button
```

## 🖼️ Post-Processing

### Image Editing Tools

**Free:**
- [Photopea](https://www.photopea.com/) - Web-based Photoshop alternative
- [GIMP](https://www.gimp.org/) - Open-source image editor
- [Canva](https://www.canva.com/) - Easy-to-use design tool

**Paid:**
- Adobe Photoshop
- Sketch
- Figma

### Recommended Edits

1. **Add device frames** (if not already done)
2. **Crop to remove system UI** (if needed)
3. **Adjust brightness/contrast** slightly
4. **Add subtle drop shadow** for depth
5. **Compress file size** while maintaining quality

### File Naming Convention

```
aura-screenshot-{screen}-{variant}.png

Examples:
- aura-screenshot-main-daytime.png
- aura-screenshot-main-rainy.png
- aura-screenshot-intro-act2.png
- aura-screenshot-daily-rhythm.png
```

## 📐 Sizing for Different Platforms

### GitHub README

**Hero image (top banner):**
- Dimension: 1280×640px
- Format: PNG or JPG
- Max size: <1MB recommended

**Feature showcase grid:**
- Dimension: 600×600px per image
- Format: PNG
- Arrange 2-3 per row

**In-line screenshots:**
- Width: 800px max (for readability)
- Maintain aspect ratio

### App Store (iOS)

**Required sizes:**
- 6.7" display: 1290×2796px
- 6.5" display: 1242×2688px
- 5.5" display: 1242×2208px

**Best practices:**
- Minimum 3 screenshots, maximum 10
- Use device frames
- Add descriptive text overlays

### Google Play Store (Android)

**Required sizes:**
- Phone: 1080×1920px minimum
- 7" Tablet: 1920×1200px
- 10" Tablet: 2560×1600px

**Best practices:**
- Minimum 2 screenshots, maximum 8
- Landscape and portrait orientations
- Feature graphic: 1024×500px

## 🎬 Creating GIFs/Videos

### Screen Recording

**iOS Simulator:**
```bash
# Use built-in screen recording
xcrun simctl io booted recordVideo aura-demo.mov

# Or use QuickTime Player:
# File → New Screen Recording → Select simulator window
```

**Android Emulator:**
```bash
# Click the three-dot menu
# Select "Record screen"
# Perform actions
# Click "Stop recording"
```

### Converting to GIF

**Using ezgif.com:**
1. Upload video file
2. Adjust frame rate (10-15 fps recommended)
3. Optimize file size
4. Download GIF

**Using FFmpeg (command line):**
```bash
# Convert MOV to GIF
ffmpeg -i aura-demo.mov -vf "fps=15,scale=400:-1" -loop 0 aura-demo.gif

# Optimize GIF size
gifsicle -O3 --colors 128 aura-demo.gif -o aura-demo-optimized.gif
```

### Recommended GIFs

1. **Intro flow** (8 seconds)
   - From opening screen through couple setup
   - Max 10MB

2. **Heartline breathing** (4 seconds, looped)
   - Show the living connection animation
   - Max 5MB

3. **Weather effects** (6 seconds)
   - Cycle through rain, snow, clouds
   - Max 8MB

4. **Time Bridge interaction** (5 seconds)
   - Opening and closing the modal
   - Max 6MB

## 📊 Creating Feature Comparison Images

### Side-by-Side Comparisons

Use image editors to create comparison layouts:

**Layout 1: Before/After**
```
┌──────────────┬──────────────┐
│   Before     │    After     │
│  (v2.4.0)    │   (v2.5.0)   │
└──────────────┴──────────────┘
```

**Layout 2: Feature Showcase**
```
┌──────────┬──────────┬──────────┐
│ Blended  │  Living  │  Daily   │
│   Sky    │ Heartline│  Rhythm  │
└──────────┴──────────┴──────────┘
```

### Annotation Tools

Add text overlays and arrows:
- [Skitch](https://evernote.com/products/skitch) (Mac)
- [ShareX](https://getsharex.com/) (Windows)
- [Annotate](https://apps.apple.com/app/annotate/id918207447) (iOS)

## 🎨 Creating Custom Graphics

### Logo Usage

**Source file:**
```
./apps/mobile/assets/AuraLogo.svg
```

**Variations to create:**
1. **Solid background** (for dark mode README)
2. **With tagline** ("Feel your atmosphere, instantly")
3. **Icon-only** (just the gradient sphere)
4. **Horizontal logo** (logo + wordmark)

### Banner Creation

**Recommended dimensions:** 1280×640px

**Content:**
- Aura logo (centered or left-aligned)
- Tagline below logo
- Gradient background (use Aura colors)
- Optional: Screenshot preview on right side

**Design in:**
- Canva (use template, customize)
- Figma (full control)
- Adobe Illustrator

### Color Palette for Graphics

```css
/* Gradient Colors */
--yellow: #FDE68A;
--pink: #FBCFE8;
--purple: #C7D2FE;
--blue: #60A5FA;

/* Background Colors */
--deep-indigo: #1e1b4b;
--midnight: #0f172a;

/* Accent Colors */
--cyan: #06b6d4;    /* User */
--pink-accent: #ec4899;  /* Partner */
--green: #22c55e;   /* Shared */
```

## 📂 File Organization

Create this structure in your repo:

```
/docs/
  /screenshots/
    /mobile/
      /ios/
        - main-daytime.png
        - main-rainy.png
        - intro-sequence.png
        - daily-rhythm.png
        - settings.png
      /android/
        - (same as iOS)
    /web/
      - (web app screenshots)
    /processed/
      - hero-banner.png
      - feature-grid-1.png
      - feature-grid-2.png
    /gifs/
      - intro-flow.gif
      - heartline-animation.gif
      - weather-effects.gif
```

## ✅ Screenshot Checklist

Before publishing, ensure:

- [ ] All screenshots are high resolution (minimum 1080p)
- [ ] Device frames applied consistently
- [ ] No debug/development UI visible
- [ ] Realistic test data (proper city names, not "Test City")
- [ ] Various weather conditions shown
- [ ] Both day and night modes captured
- [ ] File sizes optimized (<500KB per image)
- [ ] Descriptive file names
- [ ] Organized in proper folders
- [ ] All images referenced in README exist
- [ ] Copyright/attribution included if using mockup tools

## 🚀 Using Screenshots in README

### Markdown Syntax

**Simple image:**
```markdown
![Alt text](./docs/screenshots/mobile/ios/main-daytime.png)
```

**Centered with size control:**
```markdown
<div align="center">
  <img src="./docs/screenshots/hero-banner.png" alt="Aura Main Screen" width="800"/>
</div>
```

**Side-by-side comparison:**
```markdown
<table>
<tr>
<td width="50%">
  <img src="./docs/screenshots/before.png" alt="Before"/>
</td>
<td width="50%">
  <img src="./docs/screenshots/after.png" alt="After"/>
</td>
</tr>
</table>
```

**GIF with caption:**
```markdown
<div align="center">
  <img src="./docs/gifs/heartline-animation.gif" alt="Living Heartline" width="400"/>
  <p><i>The heartline breathes with a 4-second cycle</i></p>
</div>
```

---

<div align="center">

**Ready to showcase Aura's beauty!** 📸

*Screenshots are worth a thousand words - make them count!*

</div>
