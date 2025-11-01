// Animation timing constants for Aura mobile app
// Optimized for mobile performance while maintaining visual fidelity

export const ANIMATION_DURATIONS = {
  // Intro animations
  CONNECTION_INTRO: 8000, // Total intro duration (extended for world map sequence)
  CONNECTION_FLASH: 1500, // Flash animation duration
  MARKER_APPEAR: 800, // Marker pop-in duration
  FADE_IN: 800, // Basic fade in
  FADE_IN_UP: 800, // Fade in with upward movement

  // Celestial animations
  CELESTIAL_UPDATE: 1000, // Update interval for sun/moon position

  // Particle animations
  PARTICLE_DRIFT: 20000, // Individual particle drift duration

  // UI animations
  PULSE: 2500, // Pulse animation for interactive elements
  BOBBLE: 8000, // Vertical bobbing motion

  // Transition animations
  GRADIENT_TRANSITION: 2000, // Weather gradient transition

  // SVG animations
  DRAW_RING: 2000, // Logo ring drawing animation
  FLOW: 60000, // Flowing line animation
} as const;

export const ANIMATION_DELAYS = {
  INTRO_TEXT: 500, // Delay before showing intro text
  MARKER_STAGGER: 200, // Stagger between marker appearances
  CONNECTION_FLASH: 1500, // Delay before flash animation
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
  ANIMATION_DURATION: 200000, // 200 seconds
} as const;
