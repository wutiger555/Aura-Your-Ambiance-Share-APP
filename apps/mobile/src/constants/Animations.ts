// Animation timing constants for Aura mobile app
// Optimized for mobile performance while maintaining visual fidelity

export const ANIMATION_DURATIONS = {
  // Intro animations - balanced for visibility
  CONNECTION_INTRO: 6300, // Map connection animation - complete journey with buffer
  CONNECTION_FLASH: 1000, // Flash effect - visible but not slow
  MARKER_APPEAR: 600, // Marker pop-in - smooth appearance
  FADE_IN: 500, // General fade in
  FADE_IN_UP: 500, // Fade with movement

  // Celestial animations
  CELESTIAL_UPDATE: 1000, // Update interval for sun/moon position

  // Particle animations
  PARTICLE_DRIFT: 15000, // Reduced from 20000ms - faster particle movement

  // UI animations
  PULSE: 2000, // Reduced from 2500ms - quicker pulse
  BOBBLE: 6000, // Reduced from 8000ms - faster bobbing

  // Transition animations
  GRADIENT_TRANSITION: 1500, // Reduced from 2000ms - smoother transitions

  // SVG animations
  DRAW_RING: 1500, // Reduced from 2000ms - faster ring drawing
  FLOW: 45000, // Reduced from 60000ms - faster flow animation
} as const;

export const ANIMATION_DELAYS = {
  INTRO_TEXT: 400, // Text appearance delay - more visible
  MARKER_STAGGER: 200, // Stagger between markers - clear sequence
  CONNECTION_FLASH: 1200, // Flash trigger delay - gives time to see markers
} as const;

export const EASING = {
  // Standard easing functions for react-native-reanimated
  EASE_IN_OUT: 'easeInOut' as const,
  EASE_OUT: 'easeOut' as const,
  EASE_IN: 'easeIn' as const,
  LINEAR: 'linear' as const,

  // Custom cubic bezier (for reference, actual implementation in components)
  CUBIC_EASE_IN_OUT: [0.165, 0.84, 0.44, 1] as const,
} as const;

// Particle system configuration
export const PARTICLE_CONFIG = {
  COUNT: 8, // Reduced from web's 20 for performance
  MIN_SIZE: 1,
  MAX_SIZE: 2.5,
  MIN_OPACITY: 0.2,
  MAX_OPACITY: 0.6,
} as const;

// Celestial body configuration
export const CELESTIAL_CONFIG = {
  SUN_COLOR: 'rgba(255, 239, 186, 0.8)',
  MOON_COLOR: 'rgba(203, 213, 225, 0.7)',
  GLOW_RADIUS: 40,
} as const;

// Marker configuration for ConnectionIntro
export const MARKER_CONFIG = {
  MY_COLOR: '#06b6d4', // cyan-500
  PARTNER_COLOR: '#ec4899', // pink-500
  SIZE: 16,
  PULSE_SCALE: 1.3,
} as const;

// Starry background configuration
export const STARRY_CONFIG = {
  STAR_COUNT: 50, // Total stars in background
  BASE_COLOR: '#1e293b', // slate-800
  CONNECTED_COLOR: '#312e81', // indigo-900
  ANIMATION_DURATION: 80000, // Reduced from 200s to 80s - faster twinkling
} as const;
