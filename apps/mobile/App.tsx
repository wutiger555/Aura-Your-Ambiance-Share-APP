import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, RefreshCw, ArrowRight } from 'lucide-react-native';
import { useLocationStore } from './src/stores/useLocationStore';
import { useWeatherStore } from './src/stores/useWeatherStore';
import {
  LocationData,
  getCoordinatesForCity,
  getWeather,
  calculateDistance,
  calculateTimeDifference,
} from '@aura/shared';

// New Components
import ConnectionIntro from './src/components/aura/ConnectionIntro';
import BlendedSky from './src/components/aura/BlendedSky';
import AuraGlobe from './src/components/aura/AuraGlobe';
import Heartline from './src/components/aura/Heartline';
import TimeBridge from './src/components/aura/TimeBridge';
import { ANIMATION_DURATIONS } from './src/constants/Animations';

type SetupStep = 'intro' | 'inputMy' | 'inputPartner' | 'done';

export default function App() {
  const {
    myLocation,
    partnerLocation,
    hasSetup,
    setMyLocation,
    setPartnerLocation,
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
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Check if setup is complete
  useEffect(() => {
    if (hasSetup && myLocation && partnerLocation) {
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
    }
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

  const handleCitySubmit = async () => {
    if (!cityInput.trim()) {
      setCityError('Please enter a city name');
      return;
    }

    setLoading(true);
    setCityError('');

    try {
      const location = await getCoordinatesForCity(cityInput.trim());

      if (!location) {
        setCityError('City not found. Please try again.');
        setLoading(false);
        return;
      }

      if (setupStep === 'inputMy') {
        setMyLocation(location);
        setCityInput('');
        setSetupStep('inputPartner');
      } else if (setupStep === 'inputPartner') {
        setPartnerLocation(location);
        setCityInput('');
        setSetupStep('done');
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
            setMyLocation(null as any);
            setPartnerLocation(null as any);
            setMyWeather(null as any);
            setPartnerWeather(null as any);
            setSetupStep('intro');
            setShowSettings(false);
            setIsFirstLoad(true);
          },
        },
      ]
    );
  };

  // Show intro animation
  if (showIntro) {
    return <ConnectionIntro />;
  }

  // Render Setup Flow
  if (setupStep !== 'done' || !myWeather || !partnerWeather) {
    return (
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.setupContainer}>
            {setupStep === 'intro' && (
              <View style={styles.introCard}>
                <Text style={styles.title}>Aura</Text>
                <Text style={styles.subtitle}>Your Ambiance Share APP</Text>
                <Text style={styles.description}>
                  Connect with someone special by sharing your ambient weather and time
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setSetupStep('inputMy')}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <ArrowRight size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {(setupStep === 'inputMy' || setupStep === 'inputPartner') && (
              <View style={styles.inputCard}>
                <Text style={styles.inputTitle}>
                  {setupStep === 'inputMy' ? 'Your Location' : "Partner's Location"}
                </Text>
                <Text style={styles.inputSubtitle}>
                  Enter the city name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="City name..."
                  placeholderTextColor="#64748b"
                  value={cityInput}
                  onChangeText={(text) => {
                    setCityInput(text);
                    setCityError('');
                  }}
                  onSubmitEditing={handleCitySubmit}
                  autoFocus
                  autoCapitalize="words"
                />

                {cityError ? (
                  <Text style={styles.errorText}>{cityError}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.disabledButton]}
                  onPress={handleCitySubmit}
                  disabled={isLoading || !cityInput.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Continue</Text>
                      <ArrowRight size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {setupStep === 'done' && isLoading && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Loading weather data...</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Calculate distance and time difference
  const distance = calculateDistance(myLocation!, partnerLocation!);
  const timeDiff = calculateTimeDifference(myWeather.timezone, partnerWeather.timezone);

  // Render Main App with new components
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Blended Sky Background with Celestial Bodies and Particles */}
      <BlendedSky
        myWeather={myWeather}
        partnerWeather={partnerWeather}
        distance={distance}
      />

      {/* AuraGlobe for Partner (Top) */}
      <AuraGlobe
        location={partnerLocation}
        weather={partnerWeather}
        position="top"
        distance={distance}
      />

      {/* AuraGlobe for Me (Bottom) */}
      <AuraGlobe
        location={myLocation}
        weather={myWeather}
        position="bottom"
        distance={distance}
      />

      {/* Heartline (Connection curve with stats) */}
      <Heartline
        distance={distance}
        timeDifference={timeDiff}
        onShowDetails={() => setShowTimeBridge(true)}
      />

      {/* Settings Button */}
      <SafeAreaView style={styles.settingsButtonContainer}>
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
          style={styles.settingsButton}
        >
          <Settings size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={fetchWeatherData}
          disabled={isLoading}
          style={styles.settingsButton}
        >
          <RefreshCw size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Settings Modal */}
      {showSettings && (
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingsButton2} onPress={handleReset}>
              <Text style={styles.settingsButtonText}>Reset Locations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingsButton2, styles.cancelButton]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.settingsButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TimeBridge Modal */}
      <TimeBridge
        visible={showTimeBridge}
        onClose={() => setShowTimeBridge(false)}
        myLocation={myLocation}
        partnerLocation={partnerLocation}
        myWeather={myWeather}
        partnerWeather={partnerWeather}
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
  safeArea: {
    flex: 1,
  },
  setupContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  introCard: {
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputCard: {
    padding: 20,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    marginBottom: 8,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  settingsButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 100,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxWidth: 400,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsButton2: {
    backgroundColor: '#06b6d4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#475569',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
