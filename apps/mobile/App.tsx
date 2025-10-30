import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Settings,
  RefreshCw,
  ArrowRight,
  Globe,
  MapPin,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react-native';
import Clock from './src/components/aura/Clock';
import { useLocationStore } from './src/stores/useLocationStore';
import { useWeatherStore } from './src/stores/useWeatherStore';
import {
  LocationData,
  getCoordinatesForCity,
  getWeather,
  calculateDistance,
  calculateTimeDifference,
  getSemanticTimeOfDay,
  getWeatherDescription,
} from '@aura/shared';
import { getWeatherGradient } from './src/constants/Gradients';

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
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if setup is complete
  useEffect(() => {
    if (hasSetup && myLocation && partnerLocation) {
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
          },
        },
      ]
    );
  };

  // Get time status icon
  const getTimeIcon = (hour: number) => {
    if (hour >= 23 || hour < 6) return Moon;
    if (hour >= 6 && hour < 9) return Coffee;
    if (hour >= 9 && hour < 18) return Sun;
    return Moon;
  };

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

  // Get gradients
  const myGradient = getWeatherGradient(
    myWeather.current.weather_code,
    myWeather.current.is_day === 1,
    distance
  );
  const partnerGradient = getWeatherGradient(
    partnerWeather.current.weather_code,
    partnerWeather.current.is_day === 1,
    distance
  );

  // Get time status
  const myHour = new Date(myWeather.current.time).getHours();
  const partnerHour = new Date(partnerWeather.current.time).getHours();
  const myTimeStatus = getSemanticTimeOfDay(myHour);
  const partnerTimeStatus = getSemanticTimeOfDay(partnerHour);
  const MyTimeIcon = getTimeIcon(myHour);
  const PartnerTimeIcon = getTimeIcon(partnerHour);

  // Render Main App
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* My Location (Top Half) */}
      <LinearGradient colors={myGradient as any} style={styles.half}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.halfContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
                <Settings size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={fetchWeatherData} disabled={isLoading}>
                <RefreshCw size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Location Info */}
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <MapPin size={16} color="white" />
                <Text style={styles.locationName}>{myLocation!.name}</Text>
              </View>
              <Text style={styles.temperature}>
                {Math.round(myWeather.current.temperature_2m)}°C
              </Text>
              <Text style={styles.weatherDesc}>
                {getWeatherDescription(myWeather.current.weather_code)}
              </Text>
              <View style={styles.timeStatus}>
                <MyTimeIcon size={16} color="white" />
                <Text style={styles.timeStatusText}>{myTimeStatus}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Divider with Clock and Stats */}
      <View style={styles.divider}>
        <Clock />
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Globe size={16} color="white" />
            <Text style={styles.statText}>{Math.round(distance)} km apart</Text>
          </View>
          {timeDiff !== 0 && (
            <View style={styles.statItem}>
              <Sun size={16} color="white" />
              <Text style={styles.statText}>
                {Math.abs(timeDiff)}h {timeDiff > 0 ? 'ahead' : 'behind'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Partner Location (Bottom Half) */}
      <LinearGradient colors={partnerGradient as any} style={styles.half}>
        <View style={styles.halfContent}>
          {/* Location Info (Rotated) */}
          <View style={[styles.locationInfo, styles.rotated]}>
            <View style={styles.timeStatus}>
              <Text style={styles.timeStatusText}>{partnerTimeStatus}</Text>
              <PartnerTimeIcon size={16} color="white" />
            </View>
            <Text style={styles.weatherDesc}>
              {getWeatherDescription(partnerWeather.current.weather_code)}
            </Text>
            <Text style={styles.temperature}>
              {Math.round(partnerWeather.current.temperature_2m)}°C
            </Text>
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{partnerLocation!.name}</Text>
              <MapPin size={16} color="white" />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Settings Modal */}
      {showSettings && (
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={handleReset}>
              <Text style={styles.settingsButtonText}>Reset Locations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingsButton, styles.cancelButton]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.settingsButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  half: {
    flex: 1,
  },
  halfContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  temperature: {
    fontSize: 64,
    fontWeight: '200',
    color: 'white',
    marginVertical: 8,
  },
  weatherDesc: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  timeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeStatusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  rotated: {
    transform: [{ rotate: '180deg' }],
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'white',
    fontSize: 14,
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
  settingsButton: {
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
