# README Visual Assets Guide

This document describes how to create and use visual assets for the GitHub README.

## Creating Screenshots for README

### Recommended Screenshots to Capture:

1. **Intro Screen** - The 4-act narrative journey
2. **Location Setup** - Couple profile and location input
3. **Main Screen** - Blended sky with globes and heartline
4. **Connection Animation** - The 5-act geographic transition
5. **Settings Modal** - World map with flight path
6. **Daily Rhythm Editor** - Side-by-side schedule comparison
7. **Time Bridge** - 24-hour timeline visualization

### Screenshot Dimensions

For optimal GitHub display:
- Mobile screenshots: 1080×1920 (portrait)
- Combine 2-3 screenshots side-by-side for comparison
- Use tools like [Shotsnapp](https://shotsnapp.com/) or [Mockuphone](https://mockuphone.com/) for device frames

### Storage Location

Store screenshots in a new directory:
```
/docs/screenshots/
  ├── intro-screen.png
  ├── location-setup.png
  ├── main-blended-sky.png
  ├── connection-animation.png
  ├── settings-modal.png
  ├── daily-rhythm.png
  └── time-bridge.png
```

## Logo Usage in README

### Current Logo File
`./apps/mobile/assets/AuraLogo.svg` - The official Aura gradient logo

### Display Methods

#### Method 1: Direct SVG (Recommended for GitHub)
```markdown
<p align="center">
  <img src="./apps/mobile/assets/AuraLogo.svg" alt="Aura Logo" width="200"/>
</p>
```

#### Method 2: Using PNG Icon
```markdown
![App Icon](./apps/mobile/assets/icon.png)
```

#### Method 3: Create Banner Image
Create a custom banner combining logo + tagline + gradient background.

## Creating a README Banner

You can create a custom banner using tools like:
- [Canva](https://www.canva.com/) - User-friendly design tool
- [Figma](https://www.figma.com/) - Professional design tool
- Adobe Photoshop/Illustrator

### Banner Specifications
- Dimensions: 1280×640px (GitHub optimal)
- Format: PNG or SVG
- Include: Aura logo, tagline, gradient background
- Save as: `/docs/assets/readme-banner.png`

## GitHub Shields/Badges

Add status badges at the top of README:

```markdown
![Version](https://img.shields.io/badge/version-2.5.0-blue)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)
```

## Demo GIFs

For animated demonstrations:
1. Use screen recording tools (iOS Simulator, Android Emulator)
2. Convert to GIF using [ezgif.com](https://ezgif.com/) or [CloudConvert](https://cloudconvert.com/)
3. Optimize file size (keep under 10MB for GitHub)
4. Store in `/docs/demos/`

Recommended GIFs:
- `intro-flow.gif` - From intro screen through location setup
- `heartline-breathing.gif` - Living heartline animation
- `weather-effects.gif` - Rain/snow/lightning effects
- `time-bridge.gif` - Opening and interacting with time bridge

## Visual Feature Showcase

Create a visual grid showing key features:

```markdown
<table>
<tr>
<td width="33%">
<img src="./docs/screenshots/blended-sky.png" alt="Blended Sky"/>
<h3 align="center">Blended Sky</h3>
<p align="center">Your worlds merge into one</p>
</td>
<td width="33%">
<img src="./docs/screenshots/heartline.png" alt="Living Heartline"/>
<h3 align="center">Living Heartline</h3>
<p align="center">Breathing connection across distance</p>
</td>
<td width="33%">
<img src="./docs/screenshots/weather-effects.png" alt="Weather Effects"/>
<h3 align="center">Dynamic Weather</h3>
<p align="center">Feel each other's atmosphere</p>
</td>
</tr>
</table>
```

## Architecture Diagram

Consider creating a visual architecture diagram showing:
- Mobile App ↔ Shared Package ↔ Web App
- API integrations (Open-Meteo, Nominatim)
- State management flow

Tools:
- [Excalidraw](https://excalidraw.com/) - Hand-drawn style
- [Draw.io](https://draw.io/) - Professional diagrams
- [Mermaid](https://mermaid.js.org/) - Markdown-based diagrams

## Color Palette Reference

For any custom graphics, use Aura's color scheme:

```
Gradient Colors (Night to Dawn):
- Yellow: #FDE68A
- Pink: #FBCFE8
- Purple: #C7D2FE
- Blue: #60A5FA

Background Colors:
- Deep Indigo: #1e1b4b
- Midnight: #0f172a

Accent Colors:
- Cyan (User): #06b6d4
- Pink (Partner): #ec4899
```
