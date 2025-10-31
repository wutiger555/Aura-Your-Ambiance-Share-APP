# Project: Aura

## Project Overview

Aura is a digital sanctuary for long-distance couples, designed to bridge the gap by creating a shared, tangible atmosphere. It translates the real-time local weather and time of two separate individuals into a single, beautifully blended visual experience, allowing you to feel your partner's environment as if it were your own.

This is a monorepo containing a web application and a mobile application.

*   **Web App:** Built with React, Vite, and TypeScript.
*   **Mobile App:** Built with React Native (Expo), TypeScript, and Zustand.
*   **Shared Package:** A shared package for business logic, types, and utilities.

## Building and Running

### Prerequisites

*   Node.js (v18 or later)
*   npm (v9 or later)

### Installation

```bash
npm install
```

### Running the Applications

*   **Web App:**
    ```bash
    npm run web
    ```
    The application will be available at `http://localhost:5173`.

*   **Mobile App:**
    ```bash
    npm run mobile
    ```
    Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with the Expo Go app.

### Building the Applications

*   **Web App:**
    ```bash
    npm run build:web
    ```

*   **Mobile App:**
    ```bash
    npm run build:mobile
    ```

## Development Conventions

*   The project uses a monorepo structure with `apps` and `packages` directories.
*   Shared code is located in the `packages/shared` directory.
*   The project uses TypeScript for type safety.
*   The web app uses Vite for development and building.
*   The mobile app uses Expo.
*   State management in the mobile app is handled by Zustand.
