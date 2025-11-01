import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Animated as RNAnimated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings as SettingsIcon, ArrowRight } from 'lucide-react-native';
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
import ConnectionIntro from './src/components/aura/ConnectionIntro';
import BlendedSky from './src/components/aura/BlendedSky';
import AuraGlobe from './src/components/aura/AuraGlobe';
import Heartline from './src/components/aura/Heartline';
import TimeBridge from './src/components/aura/TimeBridge';
import DSTIndicator from './src/components/aura/DSTIndicator';
import Settings from './src/components/Settings';
import { ANIMATION_DURATIONS, MARKER_CONFIG, STARRY_CONFIG } from './src/constants/Animations';
import { generateStars } from './src/utils/animationUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [cityInput, setCityInput] = useState('');
  const [cityError, setCityError] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Star animations for setup flow
  const star1Opacity = useRef(new RNAnimated.Value(0)).current;
  const star1Scale = useRef(new RNAnimated.Value(0)).current;
  const star2Opacity = useRef(new RNAnimated.Value(0)).current;
  const star2Scale = useRef(new RNAnimated.Value(0)).current;
  const logoOpacity = useRef(new RNAnimated.Value(0)).current;
  const logoScale = useRef(new RNAnimated.Value(0)).current;

  // Generate stars for setup background
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

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
    } else {
      // If no locations set, ensure we're in setup mode
      setSetupStep('intro');
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

  // Animate star when location is set
  const animateStar = (starOpacity: RNAnimated.Value, starScale: RNAnimated.Value) => {
    RNAnimated.parallel([
      RNAnimated.timing(starOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.sequence([
        RNAnimated.timing(starScale, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
        RNAnimated.timing(starScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Animate logo combination
  const animateLogoCombination = () => {
    // Move stars together
    RNAnimated.parallel([
      RNAnimated.timing(star1Scale, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.timing(star2Scale, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show logo
      RNAnimated.parallel([
        RNAnimated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After logo animation, transition to connecting
        setTimeout(() => {
          setSetupStep('connecting');
          // Then fetch weather and go to done
          setTimeout(() => {
            setSetupStep('done');
          }, 2000);
        }, 1500);
      });
    });
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
        // Animate first star
        animateStar(star1Opacity, star1Scale);
        setTimeout(() => {
          setSetupStep('inputPartner');
        }, 1000);
      } else if (setupStep === 'inputPartner') {
        setPartnerLocation(location);
        setCityInput('');
        // Animate second star
        animateStar(star2Opacity, star2Scale);
        // After second star animation, show logo combination
        setTimeout(() => {
          animateLogoCombination();
        }, 1000);
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
            // Reset animations
            star1Opacity.setValue(0);
            star1Scale.setValue(0);
            star2Opacity.setValue(0);
            star2Scale.setValue(0);
            logoOpacity.setValue(0);
            logoScale.setValue(0);
          },
        },
      ]
    );
  };

  // Show intro animation
  if (showIntro) {
    return <ConnectionIntro />;
  }

  // Show connecting animation
  if (setupStep === 'connecting') {
    return <ConnectionIntro />;
  }

  // Render Setup Flow
  if (setupStep !== 'done' || !myWeather || !partnerWeather) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Background stars */}
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.bgStar,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity * 0.3,
              },
            ]}
          />
        ))}

        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.setupContainer}>
            {setupStep === 'intro' && (
              <View style={styles.introCard}>
                <Image
                  source={require('./assets/aura-logo.png')}
                  style={styles.introLogo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Aura</Text>
                <Text style={styles.subtitle}>Feel your atmosphere, instantly</Text>
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
                {/* Animated stars - always rendered, controlled by opacity */}
                <RNAnimated.View
                  style={[
                    styles.animatedStar,
                    {
                      left: SCREEN_WIDTH * 0.2,
                      top: 60,
                      opacity: star1Opacity,
                      transform: [{ scale: star1Scale }],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <View style={[styles.starDot, { backgroundColor: MARKER_CONFIG.MY_COLOR }]} />
                  <View
                    style={[
                      styles.starPulse,
                      { backgroundColor: MARKER_CONFIG.MY_COLOR, opacity: 0.4 },
                    ]}
                  />
                </RNAnimated.View>

                <RNAnimated.View
                  style={[
                    styles.animatedStar,
                    {
                      right: SCREEN_WIDTH * 0.2,
                      top: 60,
                      opacity: star2Opacity,
                      transform: [{ scale: star2Scale }],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[styles.starDot, { backgroundColor: MARKER_CONFIG.PARTNER_COLOR }]}
                  />
                  <View
                    style={[
                      styles.starPulse,
                      { backgroundColor: MARKER_CONFIG.PARTNER_COLOR, opacity: 0.4 },
                    ]}
                  />
                </RNAnimated.View>

                {/* Logo (shown after both stars combine) */}
                <RNAnimated.View
                  style={[
                    styles.centerLogo,
                    {
                      opacity: logoOpacity,
                      transform: [{ scale: logoScale }],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Image
                    source={require('./assets/aura-logo.png')}
                    style={styles.centerLogoImage}
                    resizeMode="contain"
                  />
                </RNAnimated.View>

                <Text style={styles.inputTitle}>
                  {setupStep === 'inputMy' ? 'Your Location' : "Partner's Location"}
                </Text>
                <Text style={styles.inputSubtitle}>Enter the city name</Text>

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

                {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}

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

      {/* DST Indicator for Partner (Top) */}
      <DSTIndicator weather={partnerWeather} position="top" />

      {/* AuraGlobe for Me (Bottom) */}
      <AuraGlobe
        location={myLocation}
        weather={myWeather}
        position="bottom"
        distance={distance}
      />

      {/* DST Indicator for Me (Bottom) */}
      <DSTIndicator weather={myWeather} position="bottom" />

      {/* Heartline (Connection curve with stats) */}
      <Heartline
        distance={distance}
        timeDifference={timeDiff}
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
        myLocation={myLocation}
        partnerLocation={partnerLocation}
        myWeather={myWeather}
        partnerWeather={partnerWeather}
        onUpdateNicknames={updateNicknames}
      />

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
  bgStar: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
  },
  introCard: {
    alignItems: 'center',
    padding: 30,
  },
  introLogo: {
    width: 200,
    height: 200,
    marginBottom: 20,
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
    position: 'relative',
    minHeight: 500,
  },
  animatedStar: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  starDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  starPulse: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  centerLogo: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 20,
  },
  centerLogoImage: {
    width: 150,
    height: 150,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 200,
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
