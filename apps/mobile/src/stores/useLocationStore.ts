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
  updateNicknames: (myNickname: string, partnerNickname: string) => void;
  clearLocations: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      myLocation: null,
      partnerLocation: null,
      hasSetup: false,
      setMyLocation: (location) => {
        console.log('[LocationStore] Setting myLocation:', location.city);
        set({ myLocation: location });
        // Only set hasSetup when both locations are present
        const state = get();
        if (state.partnerLocation) {
          console.log('[LocationStore] Both locations set, marking hasSetup = true');
          set({ hasSetup: true });
        }
      },
      setPartnerLocation: (location) => {
        console.log('[LocationStore] Setting partnerLocation:', location.city);
        set({ partnerLocation: location });
        // Only set hasSetup when both locations are present
        const state = get();
        if (state.myLocation) {
          console.log('[LocationStore] Both locations set, marking hasSetup = true');
          set({ hasSetup: true });
        }
      },
      updateNicknames: (myNickname, partnerNickname) =>
        set((state) => ({
          myLocation: state.myLocation
            ? { ...state.myLocation, nickname: myNickname }
            : null,
          partnerLocation: state.partnerLocation
            ? { ...state.partnerLocation, nickname: partnerNickname }
            : null,
        })),
      clearLocations: () => set({ myLocation: null, partnerLocation: null, hasSetup: false }),
    }),
    {
      name: 'aura-location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
