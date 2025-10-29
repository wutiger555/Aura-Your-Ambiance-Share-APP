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

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **APIs:**
    *   **Google Gemini API:** For natural language-based geolocation lookup (city name to coordinates and vice-versa).
    *   **Open-Meteo API:** For comprehensive and free weather data.

---

## 🚀 Getting Started

Follow these instructions to set up and run Aura on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   A package manager like `npm` or `yarn`
*   A Google Gemini API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aura.git
    cd aura
    ```

2.  **Install dependencies:**
    This project is configured to use dependencies from a CDN via an import map in `index.html`, so no `npm install` is required for the core libraries (React, @google/genai). If you add other dependencies, you'll need to manage them accordingly.

3.  **Set up your Environment Variables:**
    Aura requires a Google Gemini API key to function. This key must be available as an environment variable. When running in a development environment that supports it (like the one this project is designed for), the `process.env.API_KEY` will be automatically populated.

    If you are setting this up in a different environment, you would typically create a `.env` file in the root of your project:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
    **Important:** Never commit your `.env` file or expose your API key in public code.

4.  **Run the application:**
    You can serve the `index.html` file using any simple local web server. A popular choice is `live-server`:
    ```bash
    # Install live-server if you don't have it
    npm install -g live-server

    # Run the server from the project root
    live-server
    ```
    Your application will now be running at `http://127.0.0.1:8080`.

## 🌐 API Integration Deep Dive

### 1. Google Gemini API

The Gemini API is the "magic" behind Aura's intuitive location setup. Instead of forcing users to find exact coordinates, we use a powerful language model to do the work.

*   **How it's used:**
    *   `getCoordinatesForCity`: Takes a user-input city name (e.g., "paris", "NYC") and asks Gemini to return the precise latitude, longitude, and the official, corrected city name in a structured JSON format. This handles typos and variations gracefully.
    *   `getCityForCoordinates`: Used for the "Use My Location" feature. After the browser provides coordinates, we ask Gemini to return the name of the city at that location.
*   **API Features Utilized:**
    *   `ai.models.generateContent`: The core function for making requests.
    *   **JSON Mode (`responseSchema`)**: We enforce a strict JSON output schema. This is crucial for reliability, ensuring we always get data back in a predictable format (`{ latitude, longitude, cityName }`) that our application can parse without errors.
*   **API Features NOT Utilized (Potential for future expansion):**
    *   **Chat (`ai.chats.create`)**: Could be used to build a "relationship journal" feature where couples can add notes about their day.
    *   **Grounding (`tools: [{googleSearch: {}}]`)**: Could provide interesting facts or news about the partner's city.
    *   **Image Generation**: Could generate an artistic, AI-powered representation of the "blended atmosphere."
*   **⚠️ Important Considerations:**
    *   **API Key:** You **must** have a valid Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Quotas & Billing:** Be mindful of the API usage limits on the free tier. For a production app, you would need to set up billing.
    *   **Accuracy:** While highly accurate, LLMs can occasionally misinterpret ambiguous city names. The app includes a confirmation step ("Did you mean...?") to mitigate this.

### 2. Open-Meteo API

Open-Meteo is a fantastic open-source weather forecast API. It's fast, reliable, and doesn't require an API key for its free-to-use models, making it perfect for projects like Aura.

*   **How it's used:**
    *   We make a single API call per location to fetch all the necessary data. The coordinates obtained from the Gemini API are passed directly to Open-Meteo.
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

This is a static React application. You can deploy it to any static site hosting service.

1.  **Build the application:** For a standard React setup, you would run `npm run build`. This creates a `build` or `dist` directory with optimized, static files.
2.  **Deploy:** Drag and drop the build folder into services like:
    *   [Vercel](https://vercel.com/)
    *   [Netlify](https://www.netlify.com/)
    *   [GitHub Pages](https://pages.github.com/)

**Remember to configure your environment variables (especially `API_KEY`) in your hosting provider's settings.**

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
