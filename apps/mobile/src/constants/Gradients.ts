import { getWeatherCategory } from '@aura/shared';

export const dayGradients = {
  clear: ['#38bdf8', '#2563eb'] as const,
  partlyCloudy: ['#0ea5e9', '#4f46e5'] as const,
  overcast: ['#64748b', '#334155'] as const,
  fog: ['#94a3b8', '#6b7280'] as const,
  drizzle: ['#0284c7', '#334155'] as const,
  rain: ['#475569', '#1f2937'] as const,
  snow: ['#e0f2fe', '#94a3b8'] as const,
  thunder: ['#1e293b', '#000000'] as const,
  default: ['#6b7280', '#374151'] as const,
};

export const distantDayGradients = {
  clear: ['#7dd3fc', '#6366f1'] as const,
  partlyCloudy: ['#38bdf8', '#475569'] as const,
  overcast: ['#475569', '#1e293b'] as const,
  fog: ['#64748b', '#4b5563'] as const,
  drizzle: ['#0369a1', '#1e293b'] as const,
  rain: ['#334155', '#111827'] as const,
  snow: ['#7dd3fc', '#64748b'] as const,
  thunder: ['#0f172a', '#000000'] as const,
  default: ['#4b5563', '#1f2937'] as const,
};

export const nightGradients = {
  clear: ['#0f172a', '#312e81'] as const,
  partlyCloudy: ['#1e293b', '#312e81'] as const,
  overcast: ['#1e293b', '#0f172a'] as const,
  fog: ['#334155', '#111827'] as const,
  drizzle: ['#312e81', '#0f172a'] as const,
  rain: ['#0f172a', '#000000'] as const,
  snow: ['#334155', '#312e81'] as const,
  thunder: ['#000000', '#312e81'] as const,
  default: ['#1f2937', '#000000'] as const,
};

export function getWeatherGradient(
  code: number,
  isDay: boolean,
  distance: number | null = null
): readonly [string, string] {
  const category = getWeatherCategory(code);
  const isDistant = distance !== null && distance > 5000;

  if (isDay) {
    const palette = isDistant ? distantDayGradients : dayGradients;
    return palette[category];
  } else {
    return nightGradients[category];
  }
}
