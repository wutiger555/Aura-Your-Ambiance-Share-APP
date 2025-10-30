import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '@aura/shared';

interface LocationStore {
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  hasSetup: boolean;
  setMyLocation: (location: LocationData) => void;
  setPartnerLocation: (location: LocationData) => void;
  clearLocations: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      myLocation: null,
      partnerLocation: null,
      hasSetup: false,
      setMyLocation: (location) => set({ myLocation: location, hasSetup: true }),
      setPartnerLocation: (location) => set({ partnerLocation: location, hasSetup: true }),
      clearLocations: () => set({ myLocation: null, partnerLocation: null, hasSetup: false }),
    }),
    {
      name: 'aura-location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
