# Aura 🔮

**Feel your atmosphere, instantly.**

---

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/15ba3cde-f1b2-48f8-80f4-5f26eb612053" alt="Aura Logo and Slogan" width="700">
</p>

Aura is a digital sanctuary for long-distance couples, designed to bridge the gap by creating a shared, tangible atmosphere. It translates the real-time local weather and time of two separate individuals into a single, beautifully blended visual experience, allowing you to feel your partner's environment as if it were your own.

## The Story of Aura

In a world more connected than ever, physical distance remains a profound challenge, especially for those in long-distance relationships. The daily nuances of life—the warmth of the morning sun, the chill of a rainy evening, the quiet of late night—are lost in translation. We text "good morning" when our partner is winding down for bed; we talk about a heatwave while they're wrapping up in a sweater. This disconnect from a shared environment is the subtle, constant reminder of the miles apart.

**Aura was born from this challenge.**

The name "Aura" was chosen to represent the unique, intangible atmosphere that surrounds a person and their location. Our core idea is to capture this local aura and share it. We asked: *What if you could not just be told about your partner's weather, but actually feel it? What if their time of day was more than just a number, but a color, a light, a mood?*

Our mission is to transform the two most fundamental environmental factors, **time and weather**, into a perceptible *Digital Aura*. When you open the app, you're not just viewing data; you are stepping into a shared sky, a blended horizon where your world and theirs meet. It's a quiet, constant connection—a shared breath across the distance.

## ✨ Features

*   **Blended Sky:** A dynamic, full-screen background that seamlessly merges the weather conditions and time of day from both locations. Your sky and your partner's sky become one.
*   **Real-time Atmosphere:** Fetches and displays current weather (temperature, conditions like sun, clouds, rain) and local time for both users.
*   **Celestial Tracking:** A beautiful, animated sun and moon arc across each user's half of the sky, accurately tracking their position from sunrise to sunset and beyond.
*   **Time Bridge:** A detailed overlay that visualizes and compares the 24-hour daily timelines for both individuals, highlighting sunrise, sunset, and current times.
*   **Connection Data:** Subtly displays the physical distance and time zone difference, grounding the digital connection in real-world context.
*   **Elegant & Minimalist UI:** A focus on a beautiful, immersive experience rather than cluttered social features.

## 🏗️ Project Structure

This is a monorepo containing multiple platforms:

```
Aura-Your-Ambiance-Share-APP/
├── apps/
│   ├── web/           # React + Vite web application
│   └── mobile/        # React Native (Expo) mobile app for iOS/Android
├── packages/
│   └── shared/        # Shared business logic, types, and utilities
└── package.json       # Root workspace configuration
```

## 🛠️ Technology Stack

### Web App
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
*   **Icons:** Lucide React

### Mobile App
*   **Framework:** React Native with Expo SDK 54
*   **State Management:** Zustand with AsyncStorage persistence
*   **UI:** React Native StyleSheet, LinearGradient, Reanimated
*   **Icons:** Lucide React Native

### Shared Package
*   **Language:** TypeScript
*   **Contains:** Business logic, type definitions, API services, utility functions

### APIs (Both Platforms)
*   **OpenStreetMap Nominatim API:** Free geolocation lookup (city name to coordinates and vice-versa). No API key required.
*   **Open-Meteo API:** Comprehensive and free weather data.

---

## 🚀 Getting Started

Follow these instructions to set up and run Aura on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   A package manager like `npm` or `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aura.git
    cd Aura-Your-Ambiance-Share-APP
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This installs dependencies for all workspaces (web, mobile, and shared).

3.  **Run the applications:**

    A set of `npm` scripts are available at the root of the monorepo to manage the applications.

    ### Mobile App (`apps/mobile`)
    ```bash
    # Start the development server
    npm run mobile

    # Then, in the Metro Bundler terminal:
    # - Press `i` to open the iOS simulator
    # - Press `a` to open the Android emulator
    # - Scan the QR code with the Expo Go app on your phone

    # To start with a clean cache (recommended after package changes)
    npm run mobile -- --clear
    ```

    ### Web App (`apps/web`)
    ```bash
    # Start the development server
    npm run web
    ```
    The application will be available at `http://localhost:5173`.

## 🌐 API Integration Deep Dive

### 1. OpenStreetMap Nominatim API

The Nominatim API provides free geolocation services without requiring an API key, making it perfect for Aura's location setup.

*   **How it's used:**
    *   `getCoordinatesForCity`: Takes a user-input city name (e.g., "paris", "NYC") and queries Nominatim to return the precise latitude, longitude, and the official city name. This handles various city name formats gracefully.
    *   `getCityForCoordinates`: Used for the "Use My Location" feature. After the browser provides coordinates, we use Nominatim's reverse geocoding to return the name of the city at that location.
*   **API Features Utilized:**
    *   **Search API**: Converts city names to coordinates with address details
    *   **Reverse Geocoding**: Converts coordinates to city names
    *   **Rate Limiting**: Automatic 1-second delay between requests to respect Nominatim's usage policy
*   **⚠️ Important Considerations:**
    *   **No API Key Required:** Completely free to use, no registration needed
    *   **Rate Limit:** 1 request per second (automatically handled by the service)
    *   **User-Agent Required:** Must include a User-Agent header (already configured as "Aura-App/1.0")
    *   **Attribution:** Please include attribution to OpenStreetMap in your app's "About" section as per their terms of service
    *   **Accuracy:** Very reliable for major cities and locations. The app includes a confirmation step ("Did you mean...?") to handle ambiguous names.

### 2. Open-Meteo API

Open-Meteo is a fantastic open-source weather forecast API. It's fast, reliable, and doesn't require an API key for its free-to-use models, making it perfect for projects like Aura.

*   **How it's used:**
    *   We make a single API call per location to fetch all the necessary data. The coordinates obtained from the Nominatim API are passed directly to Open-Meteo.
*   **API Features Utilized:**
    *   `current`: `temperature_2m`, `is_day`, `weather_code` (a numerical code we map to icons and descriptions).
    *   `daily`: `sunrise`, `sunset` times for the celestial tracking feature.
    *   `timezone`: Essential for accurate local time display and calculating the time difference.
*   **API Features NOT Utilized (Potential for future expansion):**
    *   **Hourly Forecasts:** Could be used to create a more detailed 24-hour timeline in the "Time Bridge."
    *   **Air Quality, UV Index, Precipitation Probability:** Could add more layers to the "digital atmosphere," providing richer environmental context.
*   **⚠️ Important Considerations:**
    *   **No API Key Needed:** The basic forecast endpoint is free and open.
    *   **Attribution:** It's good practice to attribute Open-Meteo in your app's "About" section as per their terms of service.

## ☁️ Deployment

### Web App
This is a static React application. You can deploy it to any static site hosting service.

1.  **Build the application:**
    ```bash
    npm run build:web
    ```
    This creates a `dist` directory in `apps/web/` with optimized, static files.

2.  **Deploy:** Upload the build folder to services like:
    *   [Vercel](https://vercel.com/)
    *   [Netlify](https://www.netlify.com/)
    *   [GitHub Pages](https://pages.github.com/)

### Mobile App
For iOS App Store and Google Play Store deployment:

1.  **iOS:** Requires macOS with Xcode. Use EAS Build:
    ```bash
    cd apps/mobile
    npx eas build --platform ios
    ```

2.  **Android:**
    ```bash
    cd apps/mobile
    npx eas build --platform android
    ```

**No environment variables needed!** Both apps use free, public APIs only.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

---

<p align="center">
  Made with ❤️ to connect hearts across the distance.
</p>
