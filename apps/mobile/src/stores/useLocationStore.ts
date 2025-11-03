import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, CoupleProfile } from '@aura/shared';

interface LocationStore {
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  coupleProfile: CoupleProfile | null; // v2.5.0: Couple personalization
  hasSetup: boolean;
  setMyLocation: (location: LocationData) => void;
  setPartnerLocation: (location: LocationData) => void;
  setCoupleProfile: (profile: CoupleProfile) => void; // v2.5.0
  updateStatusMessage: (isMe: boolean, message: string) => void; // v2.5.0
  updateMilestoneDates: (dates: { // v2.5.0
    relationshipStart?: string;
    nextMeetingDate?: string;
    lastMetDate?: string;
  }) => void;
  updateNicknames: (myNickname: string, partnerNickname: string) => void;
  clearLocations: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      myLocation: null,
      partnerLocation: null,
      coupleProfile: null, // v2.5.0
      hasSetup: false,
      setMyLocation: (location) => {
        console.log('[LocationStore] Setting myLocation:', location.name);
        set({ myLocation: location });
        // Only set hasSetup when both locations are present
        const state = get();
        if (state.partnerLocation) {
          console.log('[LocationStore] Both locations set, marking hasSetup = true');
          set({ hasSetup: true });
        }
      },
      setPartnerLocation: (location) => {
        console.log('[LocationStore] Setting partnerLocation:', location.name);
        set({ partnerLocation: location });
        // Only set hasSetup when both locations are present
        const state = get();
        if (state.myLocation) {
          console.log('[LocationStore] Both locations set, marking hasSetup = true');
          set({ hasSetup: true });
        }
      },
      // v2.5.0: Set couple profile
      setCoupleProfile: (profile) => {
        console.log('[LocationStore] Setting coupleProfile:', profile.myName, '&', profile.partnerName);
        set({ coupleProfile: profile });
      },
      // v2.5.0: Update status message
      updateStatusMessage: (isMe, message) =>
        set((state) => ({
          myLocation: isMe && state.myLocation
            ? { ...state.myLocation, statusMessage: message }
            : state.myLocation,
          partnerLocation: !isMe && state.partnerLocation
            ? { ...state.partnerLocation, statusMessage: message }
            : state.partnerLocation,
        })),
      // v2.5.0: Update milestone dates
      updateMilestoneDates: (dates) =>
        set((state) => ({
          coupleProfile: state.coupleProfile
            ? {
                ...state.coupleProfile,
                relationshipStart: dates.relationshipStart ?? state.coupleProfile.relationshipStart,
                nextMeetingDate: dates.nextMeetingDate ?? state.coupleProfile.nextMeetingDate,
                lastMetDate: dates.lastMetDate ?? state.coupleProfile.lastMetDate,
              }
            : null,
        })),
      updateNicknames: (myNickname, partnerNickname) =>
        set((state) => ({
          myLocation: state.myLocation
            ? { ...state.myLocation, nickname: myNickname }
            : null,
          partnerLocation: state.partnerLocation
            ? { ...state.partnerLocation, nickname: partnerNickname }
            : null,
        })),
      clearLocations: () => set({
        myLocation: null,
        partnerLocation: null,
        coupleProfile: null, // v2.5.0: Also clear profile
        hasSetup: false
      }),
    }),
    {
      name: 'aura-location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
