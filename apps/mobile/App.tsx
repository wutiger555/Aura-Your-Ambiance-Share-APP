import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocationStore } from './src/stores/useLocationStore';
import { useWeatherStore } from './src/stores/useWeatherStore';
import { useMessageStore } from './src/stores/useMessageStore'; // v2.5.0
import { useDisplaySettings } from './src/stores/useDisplaySettings'; // v2.6.0
import {
  getCoordinatesForCity,
  getWeather,
  calculateDistance,
  calculateTimeDifference,
} from '@aura/shared';

// New Components
// v2.6.5: Using Lottie for premium animations without memory overhead
import IntroScreen from './src/components/aura/IntroScreenLottie'; // Lottie - professional animations, zero memory overhead
// import IntroScreen from './src/components/aura/IntroScreenNative'; // Native Animated API - simple fallback
// import IntroScreen from './src/components/aura/IntroScreenStatic'; // ZERO animations fallback
// import IntroScreen from './src/components/aura/IntroScreenAnimated'; // Reanimated (crashes on some simulators)
import OnboardingFlow from './src/components/aura/OnboardingFlow'; // v2.6.5: Tutorial-style guided onboarding
import ConnectionIntro from './src/components/aura/ConnectionIntroRedesign';
import BlendedSky from './src/components/aura/BlendedSky';
import AuraGlobeMinimal from './src/components/aura/AuraGlobeMinimal'; // v2.6.0: Minimal version
import HeartlineRedesign from './src/components/aura/HeartlineRedesign'; // v2.6.0: Redesigned with swap button
import TimeBridge from './src/components/aura/TimeBridge';
import SettingsTabbed from './src/components/SettingsTabbed'; // v2.6.0: Tab-based settings
import StatusEditModal from './src/components/aura/StatusEditModal'; // v2.5.0
import RelationshipMilestone from './src/components/aura/RelationshipMilestone'; // v2.5.0
import MilestoneEditModal from './src/components/aura/MilestoneEditModal'; // v2.5.0
import WeatherReminderCard from './src/components/aura/WeatherReminderCard'; // v2.5.0
import MessageCenter from './src/components/aura/MessageCenter'; // v2.5.0
import SettingsButton from './src/components/aura/SettingsButton'; // v2.6.0: Elegant gear button
import AlarmButton from './src/components/aura/AlarmButton'; // v2.7.0: Multi-timezone alarm button
import AlarmListScreen from './src/components/aura/AlarmListScreen'; // v2.7.0: Alarm list screen
import { ANIMATION_DURATIONS } from './src/constants/Animations';
import { generateWeatherReminders, generateTemperatureDifferenceReminder } from './src/utils/weatherReminders'; // v2.5.0
import { hasLocationChanged, autoDetectCity } from './src/utils/locationService'; // v2.6.0

// v2.6.0: Simplified flow - intro → quickStart → connecting → done
type SetupStep = 'intro' | 'quickStart' | 'connecting' | 'done';

export default function App() {
  const {
    myLocation,
    partnerLocation,
    coupleProfile, // v2.5.0
    mySchedule, // v2.4.0
    partnerSchedule, // v2.4.0
    hasSetup,
    setMyLocation,
    setPartnerLocation,
    setCoupleProfile, // v2.5.0
    updateStatusMessage, // v2.5.0
    updateMilestoneDates, // v2.5.0
    updateNicknames,
    setSchedules, // v2.4.0
    clearLocations,
  } = useLocationStore();

  const {
    myWeather,
    partnerWeather,
    isLoading,
    setMyWeather,
    setPartnerWeather,
    setLoading,
    setError,
  } = useWeatherStore();

  const {
    messages,
    addMessage,
    deleteMessage,
  } = useMessageStore(); // v2.5.0

  // v2.6.0: Display settings store
  const {
    swappedPositions,
    showMilestones,
    showWeatherReminders,
    showProfileInfo,
    showSunTimes,
    showHeartlineInfo,
    toggleSwappedPositions,
    setAppearanceMode,
  } = useDisplaySettings();

  const [setupStep, setSetupStep] = useState<SetupStep>('intro');

  // Debug: Log when messages change
  useEffect(() => {
    console.log('[App] Messages count changed:', messages.length);
    console.log('[App] Messages array:', JSON.stringify(messages, null, 2));
  }, [messages]);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeBridge, setShowTimeBridge] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false); // v2.6.5: Track if user is resetting
  const [editingStatus, setEditingStatus] = useState<'me' | 'partner' | null>(null); // v2.5.0
  const [showMilestoneEdit, setShowMilestoneEdit] = useState(false); // v2.5.0
  const [showMessages, setShowMessages] = useState(false); // v2.5.0
  const [showAlarms, setShowAlarms] = useState(false); // v2.7.0: Multi-timezone alarms
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false); // v2.6.0: Track if we've checked location

  // v2.5.0: Generate weather reminders (must be before any conditional returns)
  const weatherReminders = useMemo(() => {
    if (!myWeather || !partnerWeather || !coupleProfile) return [];

    const partnerReminders = generateWeatherReminders(
      partnerWeather,
      coupleProfile.partnerName
    );

    const tempDiffReminder = generateTemperatureDifferenceReminder(
      myWeather,
      partnerWeather,
      coupleProfile.myName,
      coupleProfile.partnerName
    );

    if (tempDiffReminder) {
      return [tempDiffReminder, ...partnerReminders];
    }

    return partnerReminders;
  }, [myWeather, partnerWeather, coupleProfile]);

  // Check if setup is complete
  useEffect(() => {
    console.log('[App] Setup check:', {
      hasSetup,
      myCity: myLocation?.name,
      partnerCity: partnerLocation?.name
    });

    if (hasSetup && myLocation && partnerLocation) {
      console.log('[App] Both locations present, proceeding to done state');
      if (isFirstLoad) {
        // Show intro animation on first load
        setShowIntro(true);
        // Fetch weather data during animation
        fetchWeatherData();
        setTimeout(() => {
          setShowIntro(false);
          setIsFirstLoad(false);
          setSetupStep('done');
        }, ANIMATION_DURATIONS.CONNECTION_INTRO);
      } else {
        // If not first load, go directly to done
        setSetupStep('done');
        fetchWeatherData();
      }
    } else if (!myLocation && !partnerLocation) {
      // Only reset to intro if both locations are null
      console.log('[App] No locations, showing intro');
      setSetupStep('intro');
    }
    // Don't change setupStep if we're mid-flow (one location set)
  }, [hasSetup, myLocation, partnerLocation]);

  // v2.6.0: Check if user's location has changed significantly
  useEffect(() => {
    const checkLocationChange = async () => {
      // Only check once per session, and only when we're in done state with existing location
      if (hasCheckedLocation || setupStep !== 'done' || !myLocation || !myWeather) {
        return;
      }

      setHasCheckedLocation(true);

      try {
        const changed = await hasLocationChanged(
          myLocation.latitude,
          myLocation.longitude,
          50 // 50km threshold
        );

        if (changed) {
          // Location has changed significantly
          Alert.alert(
            '📍 Location Changed?',
            `It looks like you might be in a different location now. Would you like to update your location?`,
            [
              {
                text: 'No, Keep Current',
                style: 'cancel',
              },
              {
                text: 'Yes, Update',
                onPress: async () => {
                  try {
                    const newLocation = await autoDetectCity();
                    if (newLocation) {
                      Alert.alert(
                        'Update Location',
                        `We detected you're now in ${newLocation.city}. Update your location?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Update',
                            onPress: () => {
                              setMyLocation({
                                name: newLocation.city,
                                latitude: newLocation.latitude,
                                longitude: newLocation.longitude,
                              });
                              // Refresh weather data
                              fetchWeatherData();
                            },
                          },
                        ]
                      );
                    }
                  } catch (error) {
                    console.error('[App] Failed to auto-detect new location:', error);
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('[App] Location change check failed:', error);
      }
    };

    checkLocationChange();
  }, [setupStep, myLocation, myWeather, hasCheckedLocation]);

  const fetchWeatherData = async () => {
    if (!myLocation || !partnerLocation) return;

    setLoading(true);
    setError(null);

    try {
      const [myW, partnerW] = await Promise.all([
        getWeather(myLocation.latitude, myLocation.longitude),
        getWeather(partnerLocation.latitude, partnerLocation.longitude),
      ]);

      if (!myW || !partnerW) {
        throw new Error('Failed to fetch weather data');
      }

      setMyWeather(myW);
      setPartnerWeather(partnerW);
    } catch (err) {
      setError('Failed to load weather data');
      Alert.alert('Error', 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  // v2.6.0: Location submission now handled by QuickStartScreen component


  const handleReset = () => {
    // Note: Confirmation is handled by SettingsTabbed's custom modal
    // No need for double confirmation with Alert.alert

    // Clear locations from store (will also clear AsyncStorage)
    clearLocations();
    // Clear weather data
    setMyWeather(null as any);
    setPartnerWeather(null as any);
    // Reset UI state
    setSetupStep('intro');
    setShowSettings(false);
    setIsFirstLoad(true);
    setIsReturningUser(true); // Mark as returning user for fast reset flow
  };

  // Show intro animation when first loading with saved locations
  if (showIntro) {
    return <ConnectionIntro />;
  }

  // Render IntroScreen (2.5s minimal animation)
  if (setupStep === 'intro') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <IntroScreen onComplete={() => setSetupStep('quickStart')} />
      </>
    );
  }

  // v2.6.5: Render OnboardingFlow (tutorial-style guided setup)
  if (setupStep === 'quickStart') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <OnboardingFlow
          isReturningUser={isReturningUser}
          onComplete={async (data) => {
            setLoading(true);

            try {
              // Geocode both cities
              const [myLoc, partnerLoc] = await Promise.all([
                getCoordinatesForCity(data.myCity),
                getCoordinatesForCity(data.partnerCity),
              ]);

              if (!myLoc || !partnerLoc) {
                Alert.alert('Error', 'Failed to find one or both cities. Please try again.');
                setLoading(false);
                return;
              }

              // Set locations
              setMyLocation(myLoc);
              setPartnerLocation(partnerLoc);

              // Set couple names and emojis if provided
              if (data.coupleNames) {
                setCoupleProfile({
                  myName: data.coupleNames.myName,
                  partnerName: data.coupleNames.partnerName,
                  myEmoji: data.coupleNames.myEmoji,
                  partnerEmoji: data.coupleNames.partnerEmoji,
                });
              }

              // Apply display mode preference
              // Map onboarding modes to display settings modes
              const displayModeMap = {
                minimal: 'minimal' as const,
                cozy: 'balanced' as const,
                full: 'detailed' as const,
              };
              setAppearanceMode(displayModeMap[data.displayMode]);

              // Proceed to connecting animation
              setSetupStep('connecting');

              // Fetch weather during animation
              fetchWeatherData();

              // After short animation, go to done
              setTimeout(() => {
                setSetupStep('done');
                setIsReturningUser(false); // Reset the flag
              }, ANIMATION_DURATIONS.CONNECTION_INTRO);
            } catch (error) {
              Alert.alert('Error', 'Failed to set up locations. Please try again.');
              setLoading(false);
            }
          }}
        />
      </>
    );
  }

  // Show connecting animation
  if (setupStep === 'connecting') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <ConnectionIntro />
      </>
    );
  }

  // Show loading state while fetching weather
  if (setupStep === 'done' && (!myWeather || !partnerWeather)) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>正在連接你們的天空...</Text>
        </View>
      </View>
    );
  }

  // Calculate distance and time difference (both are guaranteed to be non-null here)
  const distance = calculateDistance(myLocation!, partnerLocation!);
  const timeDiff = calculateTimeDifference(myWeather!.timezone, partnerWeather!.timezone);

  // v2.6.0: Determine actual locations based on swap state
  const topLocation = swappedPositions ? myLocation : partnerLocation;
  const topWeather = swappedPositions ? myWeather : partnerWeather;
  const topProfile = swappedPositions
    ? (coupleProfile ? {
        name: coupleProfile.myName,
        emoji: coupleProfile.myEmoji,
      } : undefined)
    : (coupleProfile ? {
        name: coupleProfile.partnerName,
        emoji: coupleProfile.partnerEmoji,
      } : undefined);

  const bottomLocation = swappedPositions ? partnerLocation : myLocation;
  const bottomWeather = swappedPositions ? partnerWeather : myWeather;
  const bottomProfile = swappedPositions
    ? (coupleProfile ? {
        name: coupleProfile.partnerName,
        emoji: coupleProfile.partnerEmoji,
      } : undefined)
    : (coupleProfile ? {
        name: coupleProfile.myName,
        emoji: coupleProfile.myEmoji,
      } : undefined);

  // Render Main App with new components (v2.6.0: Minimalist redesign)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

      {/* Blended Sky Background with Celestial Bodies and Particles */}
      {/* v2.6.6: Now respects swap state */}
      <BlendedSky
        topWeather={topWeather!}
        bottomWeather={bottomWeather!}
        distance={distance}
      />

      {/* AuraGlobeMinimal for Top Location (v2.6.0: Minimal version with display settings) */}
      <AuraGlobeMinimal
        location={topLocation!}
        weather={topWeather!}
        position="top"
        showProfileInfo={showProfileInfo}
        showSunTimes={showSunTimes}
        profile={topProfile}
      />

      {/* AuraGlobeMinimal for Bottom Location (v2.6.0: Minimal version with display settings) */}
      <AuraGlobeMinimal
        location={bottomLocation!}
        weather={bottomWeather!}
        position="bottom"
        showProfileInfo={showProfileInfo}
        showSunTimes={showSunTimes}
        profile={bottomProfile}
      />

      {/* HeartlineRedesign (v2.6.0: Connection curve with elegant swap button) */}
      <HeartlineRedesign
        distance={distance}
        timeDifference={timeDiff}
        myWeather={myWeather}
        partnerWeather={partnerWeather}
        onShowDetails={() => setShowTimeBridge(true)}
        onSwapPositions={toggleSwappedPositions}
        showInfo={showHeartlineInfo}
      />

      {/* SettingsButton (v2.6.0: Elegant gear button replacing ConnectionWidget) */}
      <SettingsButton
        onPress={() => setShowSettings(true)}
      />

      {/* AlarmButton (v2.7.0: Multi-timezone alarm access) */}
      <AlarmButton
        onPress={() => setShowAlarms(true)}
      />

      {/* v2.5.0/v2.6.0: Relationship Milestone (conditional based on DisplaySettings) */}
      {showMilestones && coupleProfile && (
        <RelationshipMilestone
          relationshipStart={coupleProfile.relationshipStart}
          nextMeetingDate={coupleProfile.nextMeetingDate}
          lastMetDate={coupleProfile.lastMetDate}
          onEdit={() => setShowMilestoneEdit(true)}
        />
      )}

      {/* v2.5.0/v2.6.0: Weather Reminder Card (conditional based on DisplaySettings) */}
      {showWeatherReminders && weatherReminders.length > 0 && (
        <WeatherReminderCard reminders={weatherReminders} />
      )}

      {/* Settings Modal (v2.6.0: Tab-based SettingsTabbed) */}
      <SettingsTabbed
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onReset={handleReset}
        myLocation={myLocation!}
        partnerLocation={partnerLocation!}
        myWeather={myWeather!}
        partnerWeather={partnerWeather!}
        mySchedule={mySchedule}
        partnerSchedule={partnerSchedule}
        onUpdateNicknames={updateNicknames}
        onUpdateSchedules={setSchedules}
      />

      {/* TimeBridge Modal */}
      <TimeBridge
        visible={showTimeBridge}
        onClose={() => setShowTimeBridge(false)}
        myLocation={myLocation!}
        partnerLocation={partnerLocation!}
        myWeather={myWeather!}
        partnerWeather={partnerWeather!}
        distance={distance}
        timeDifference={timeDiff}
      />

      {/* v2.5.0: Status Edit Modal */}
      <StatusEditModal
        visible={editingStatus !== null}
        currentStatus={
          editingStatus === 'me'
            ? myLocation?.statusMessage || ''
            : editingStatus === 'partner'
            ? partnerLocation?.statusMessage || ''
            : ''
        }
        personName={
          editingStatus === 'me'
            ? coupleProfile?.myName || 'You'
            : editingStatus === 'partner'
            ? coupleProfile?.partnerName || 'Partner'
            : ''
        }
        onSave={(newStatus) => {
          if (editingStatus) {
            updateStatusMessage(editingStatus === 'me', newStatus);
            setEditingStatus(null);
          }
        }}
        onClose={() => setEditingStatus(null)}
      />

      {/* v2.5.0: Milestone Edit Modal */}
      <MilestoneEditModal
        visible={showMilestoneEdit}
        relationshipStart={coupleProfile?.relationshipStart}
        nextMeetingDate={coupleProfile?.nextMeetingDate}
        lastMetDate={coupleProfile?.lastMetDate}
        onSave={(dates) => {
          updateMilestoneDates(dates);
          setShowMilestoneEdit(false);
        }}
        onClose={() => setShowMilestoneEdit(false)}
      />

      {/* v2.5.0: Message Center */}
      <MessageCenter
        visible={showMessages}
        messages={messages}
        myName={coupleProfile?.myName || 'You'}
        partnerName={coupleProfile?.partnerName || 'Partner'}
        onClose={() => setShowMessages(false)}
        onSend={(content, emoji) => addMessage(content, true, emoji)}
        onDelete={deleteMessage}
      />

      {/* v2.7.0: Multi-timezone Alarm List */}
      <AlarmListScreen
        visible={showAlarms}
        onClose={() => setShowAlarms(false)}
      />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#e0e7ff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
