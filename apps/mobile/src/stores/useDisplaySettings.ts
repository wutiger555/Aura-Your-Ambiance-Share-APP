import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * DisplaySettings - Controls what elements are shown on the main screen
 * v2.6.0: Minimalist redesign with user-configurable display options
 */

export type AppearanceMode = 'minimal' | 'balanced' | 'detailed';

export interface DisplaySettings {
  // Element toggles
  showMilestones: boolean;
  showWeatherReminders: boolean;
  showProfileInfo: boolean;
  showSunTimes: boolean;
  showTimeStatus: boolean;
  showStatusMessages: boolean;
  showHeartlineInfo: boolean;

  // Appearance mode (presets)
  appearanceMode: AppearanceMode;

  // Position swap
  swappedPositions: boolean;
}

interface DisplaySettingsStore extends DisplaySettings {
  // Actions
  setAppearanceMode: (mode: AppearanceMode) => void;
  toggleSwappedPositions: () => void;
  toggleElement: (element: keyof Omit<DisplaySettings, 'appearanceMode' | 'swappedPositions'>) => void;
  resetToDefaults: () => void;
}

// Default settings: Minimal mode
const defaultSettings: DisplaySettings = {
  showMilestones: false,
  showWeatherReminders: false,
  showProfileInfo: false,
  showSunTimes: false,
  showTimeStatus: false,
  showStatusMessages: false,
  showHeartlineInfo: false,
  appearanceMode: 'minimal',
  swappedPositions: false,
};

// Preset configurations for each appearance mode
const appearanceModePresets: Record<AppearanceMode, Partial<DisplaySettings>> = {
  minimal: {
    showMilestones: false,
    showWeatherReminders: false,
    showProfileInfo: false,
    showSunTimes: false,
    showTimeStatus: false,
    showStatusMessages: false,
    showHeartlineInfo: false,
  },
  balanced: {
    showMilestones: true,
    showWeatherReminders: true,
    showProfileInfo: true,
    showSunTimes: false,
    showTimeStatus: false,
    showStatusMessages: false,
    showHeartlineInfo: true,
  },
  detailed: {
    showMilestones: true,
    showWeatherReminders: true,
    showProfileInfo: true,
    showSunTimes: true,
    showTimeStatus: true,
    showStatusMessages: true,
    showHeartlineInfo: true,
  },
};

export const useDisplaySettings = create<DisplaySettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setAppearanceMode: (mode: AppearanceMode) => {
        const preset = appearanceModePresets[mode];
        set({
          appearanceMode: mode,
          ...preset,
        });
      },

      toggleSwappedPositions: () => {
        set((state) => ({ swappedPositions: !state.swappedPositions }));
      },

      toggleElement: (element) => {
        set((state) => ({
          [element]: !state[element],
          // When manually toggling, switch to custom mode (stay on current mode but mark as customized)
          // For simplicity, we'll just toggle the element without changing the mode
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'aura-display-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
