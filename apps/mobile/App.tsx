import React, { useState, useEffect } from 'react';
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
import { Settings as SettingsIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from './src/stores/useLocationStore';
import { useWeatherStore } from './src/stores/useWeatherStore';
import {
  getCoordinatesForCity,
  getWeather,
  calculateDistance,
  calculateTimeDifference,
} from '@aura/shared';

// New Components
import IntroScreen from './src/components/aura/IntroScreen';
import LocationInputScreen from './src/components/aura/LocationInputScreen';
import ConnectionIntro from './src/components/aura/ConnectionIntro';
import BlendedSky from './src/components/aura/BlendedSky';
import AuraGlobe from './src/components/aura/AuraGlobe';
import Heartline from './src/components/aura/Heartline';
import TimeBridge from './src/components/aura/TimeBridge';
import DSTPanel from './src/components/aura/DSTPanel';
import Settings from './src/components/Settings';
import { ANIMATION_DURATIONS } from './src/constants/Animations';

type SetupStep = 'intro' | 'inputMy' | 'inputPartner' | 'connecting' | 'done';

export default function App() {
  const {
    myLocation,
    partnerLocation,
    hasSetup,
    setMyLocation,
    setPartnerLocation,
    updateNicknames,
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

  const [setupStep, setSetupStep] = useState<SetupStep>('intro');
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeBridge, setShowTimeBridge] = useState(false);
  const [cityError, setCityError] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Check if setup is complete
  useEffect(() => {
    console.log('[App] Setup check:', {
      hasSetup,
      myCity: myLocation?.city,
      partnerCity: partnerLocation?.city
    });

    if (hasSetup && myLocation && partnerLocation) {
      console.log('[App] Both locations present, proceeding to done state');
      if (isFirstLoad) {
        // Show intro animation on first load
        setShowIntro(true);
        setTimeout(() => {
          setShowIntro(false);
          setIsFirstLoad(false);
        }, ANIMATION_DURATIONS.CONNECTION_INTRO);
      }
      setSetupStep('done');
      fetchWeatherData();
    } else if (!myLocation && !partnerLocation) {
      // Only reset to intro if both locations are null
      console.log('[App] No locations, showing intro');
      setSetupStep('intro');
    }
    // Don't change setupStep if we're mid-flow (one location set)
  }, [hasSetup, myLocation, partnerLocation]);

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

  // Handle location submission for both steps
  const handleLocationSubmit = async (city: string, step: 'my' | 'partner') => {
    setCityError('');

    try {
      setLoading(true);
      const location = await getCoordinatesForCity(city);

      if (!location) {
        setCityError('City not found. Please try again.');
        return;
      }

      if (step === 'my') {
        setMyLocation(location);
        // Quick transition to partner input
        setTimeout(() => {
          setSetupStep('inputPartner');
        }, 400);
      } else {
        setPartnerLocation(location);
        // Quick transition to connecting animation
        setTimeout(() => {
          setSetupStep('connecting');
          // Auto-advance to done after animation completes
          setTimeout(() => {
            setSetupStep('done');
          }, ANIMATION_DURATIONS.CONNECTION_INTRO);
        }, 400);
      }
    } catch (error) {
      setCityError('Failed to find city. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    Alert.alert(
      'Reset Locations',
      'Are you sure you want to reset your locations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Clear locations from store (will also clear AsyncStorage)
            clearLocations();
            // Clear weather data
            setMyWeather(null as any);
            setPartnerWeather(null as any);
            // Reset UI state
            setSetupStep('intro');
            setShowSettings(false);
            setIsFirstLoad(true);
            setCityError('');
          },
        },
      ]
    );
  };

  // Show intro animation when first loading with saved locations
  if (showIntro) {
    return <ConnectionIntro />;
  }

  // Render IntroScreen
  if (setupStep === 'intro') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <IntroScreen onStart={() => setSetupStep('inputMy')} />
      </>
    );
  }

  // Render LocationInputScreen for user's city
  if (setupStep === 'inputMy') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LocationInputScreen
          step="my"
          onSubmit={(city) => handleLocationSubmit(city, 'my')}
          isLoading={isLoading}
          error={cityError}
        />
      </>
    );
  }

  // Render LocationInputScreen for partner's city
  if (setupStep === 'inputPartner') {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LocationInputScreen
          step="partner"
          onSubmit={(city) => handleLocationSubmit(city, 'partner')}
          isLoading={isLoading}
          error={cityError}
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
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  // Calculate distance and time difference (both are guaranteed to be non-null here)
  const distance = calculateDistance(myLocation!, partnerLocation!);
  const timeDiff = calculateTimeDifference(myWeather!.timezone, partnerWeather!.timezone);

  // Render Main App with new components
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Blended Sky Background with Celestial Bodies and Particles */}
      <BlendedSky
        myWeather={myWeather!}
        partnerWeather={partnerWeather!}
        distance={distance}
      />

      {/* AuraGlobe for Partner (Top) */}
      <AuraGlobe
        location={partnerLocation!}
        weather={partnerWeather!}
        position="top"
        distance={distance}
      />

      {/* AuraGlobe for Me (Bottom) */}
      <AuraGlobe
        location={myLocation!}
        weather={myWeather!}
        position="bottom"
        distance={distance}
      />

      {/* Heartline (Connection curve with stats) */}
      <Heartline
        distance={distance}
        timeDifference={timeDiff}
        onShowDetails={() => setShowTimeBridge(true)}
      />

      {/* DST Panel - Prominent display for DST status and warnings */}
      <DSTPanel
        myLocation={myLocation!}
        partnerLocation={partnerLocation!}
        myWeather={myWeather!}
        partnerWeather={partnerWeather!}
        currentTimeDiff={timeDiff}
        onShowDetails={() => setShowTimeBridge(true)}
      />

      {/* Settings Button (Bottom Right) */}
      <SafeAreaView style={styles.settingsButtonContainer} edges={['bottom', 'right']}>
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
          style={styles.settingsButton}
        >
          <SettingsIcon size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Settings Modal */}
      <Settings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onReset={handleReset}
        myLocation={myLocation!}
        partnerLocation={partnerLocation!}
        myWeather={myWeather!}
        partnerWeather={partnerWeather!}
        onUpdateNicknames={updateNicknames}
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
    </View>
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
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  settingsButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 100,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
