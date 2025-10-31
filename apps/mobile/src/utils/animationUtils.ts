// Animation utility functions for Aura mobile app

/**
 * Easing function for celestial body movement (sine curve for natural arc)
 */
export const easeInOutSine = (x: number): number => {
  return -(Math.cos(Math.PI * x) - 1) / 2;
};

/**
 * Generates random position for particles
 */
export const generateRandomPosition = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generates random particle data for drift animation
 */
export interface ParticleData {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export const generateParticles = (
  count: number,
  width: number,
  height: number,
  minSize: number,
  maxSize: number,
  minOpacity: number,
  maxOpacity: number,
  baseDuration: number
): ParticleData[] => {
  const particles: ParticleData[] = [];

  for (let i = 0; i < count; i++) {
    const startX = generateRandomPosition(0, width);
    const startY = generateRandomPosition(0, height);

    // Particles drift slightly in a random direction
    const driftX = generateRandomPosition(-50, 50);
    const driftY = generateRandomPosition(-100, 100);

    particles.push({
      id: `particle-${i}`,
      startX,
      startY,
      endX: startX + driftX,
      endY: startY + driftY,
      size: generateRandomPosition(minSize, maxSize),
      opacity: generateRandomPosition(minOpacity, maxOpacity),
      duration: baseDuration + generateRandomPosition(-5000, 5000),
      delay: generateRandomPosition(0, baseDuration),
    });
  }

  return particles;
};

/**
 * Calculate percentage through the day/night cycle
 */
export const calculateTimePercentage = (
  now: Date,
  sunrise: Date,
  sunset: Date,
  isDay: boolean
): number => {
  let totalDuration: number, elapsed: number;

  if (isDay) {
    totalDuration = sunset.getTime() - sunrise.getTime();
    elapsed = now.getTime() - sunrise.getTime();
  } else {
    // Night time calculation
    const yesterdaySunset = new Date(sunset.getTime() - 24 * 60 * 60 * 1000);
    const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

    if (now < sunrise) {
      // After midnight, before sunrise
      totalDuration = sunrise.getTime() - yesterdaySunset.getTime();
      elapsed = now.getTime() - yesterdaySunset.getTime();
    } else {
      // After sunset, before midnight
      totalDuration = nextSunrise.getTime() - sunset.getTime();
      elapsed = now.getTime() - sunset.getTime();
    }
  }

  return Math.max(0, Math.min(1, elapsed / totalDuration));
};

/**
 * Calculate celestial body rotation angle based on time percentage
 */
export const calculateCelestialRotation = (
  timePercentage: number,
  isTop: boolean
): number => {
  const easedPercentage = easeInOutSine(timePercentage);
  return isTop ? 180 - easedPercentage * 180 : easedPercentage * 180;
};

/**
 * Interpolate between two colors (simple RGB interpolation)
 */
export const interpolateColor = (
  color1: string,
  color2: string,
  percentage: number
): string => {
  // Simple implementation - could be enhanced for better color interpolation
  // For now, we'll just return color1 or color2 based on percentage
  return percentage < 0.5 ? color1 : color2;
};

/**
 * Generate random stars for starry background
 */
export interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const generateStars = (count: number, width: number, height: number): Star[] => {
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      id: `star-${i}`,
      x: generateRandomPosition(0, width),
      y: generateRandomPosition(0, height),
      size: generateRandomPosition(0.5, 1.5),
      opacity: generateRandomPosition(0.3, 1),
    });
  }

  return stars;
};
