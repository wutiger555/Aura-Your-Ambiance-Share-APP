import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Heart,
  Briefcase,
  Users,
  Globe,
  MapPin,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import AuraLogo from './AuraLogo';
import { autoDetectCity } from '../../utils/locationService';
import { searchCities, CitySuggestion, debounce } from '../../utils/cityAutocomplete';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingFlowProps {
  onComplete: (data: {
    myCity: string;
    partnerCity: string;
    useCase: string;
    displayMode: 'minimal' | 'cozy' | 'full';
    coupleNames?: { myName: string; partnerName: string };
  }) => void;
  isReturningUser?: boolean; // If true, skip welcome and purpose
}

type Step =
  | 'welcome'
  | 'purpose'
  | 'location-you'
  | 'location-partner'
  | 'display'
  | 'personalize';

const USE_CASES = [
  {
    id: 'relationship',
    label: 'Long-distance relationship',
    icon: Heart,
    color: '#ec4899',
  },
  { id: 'work', label: 'Remote work team', icon: Briefcase, color: '#8b5cf6' },
  { id: 'family', label: 'Family abroad', icon: Users, color: '#06b6d4' },
  {
    id: 'friends',
    label: 'Friends around the world',
    icon: Globe,
    color: '#10b981',
  },
];

const DISPLAY_MODES = [
  {
    id: 'minimal' as const,
    label: 'Minimal',
    description: 'Clean and simple',
    features: ['Time & Weather', 'Connection status'],
  },
  {
    id: 'cozy' as const,
    label: 'Cozy',
    description: 'Balanced experience',
    features: ['Time & Weather', 'Milestones', 'Connection status'],
  },
  {
    id: 'full' as const,
    label: 'Full',
    description: 'Everything visible',
    features: ['All information', 'Reminders', 'Rich details'],
  },
];

/**
 * OnboardingFlow - Tutorial-style guided setup
 * v2.6.5: Complete redesign with stepped progression
 *
 * Design principles:
 * - One clear action per screen
 * - Beautiful transitions (FadeIn/SlideIn)
 * - Progress indicator
 * - Consistent autocomplete for both locations
 * - Award-winning app aesthetics (inspired by Calm, Headspace, Duolingo)
 */
export default function OnboardingFlow({ onComplete, isReturningUser = false }: OnboardingFlowProps) {
  // If returning user (reset), skip welcome and purpose
  const [step, setStep] = useState<Step>(isReturningUser ? 'location-you' : 'welcome');
  const [useCase, setUseCase] = useState(isReturningUser ? 'relationship' : ''); // Default for reset
  const [displayMode, setDisplayMode] = useState<'minimal' | 'cozy' | 'full'>('cozy');

  // Location states
  const [myCity, setMyCity] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [myCitySuggestions, setMyCitySuggestions] = useState<CitySuggestion[]>([]);
  const [partnerCitySuggestions, setPartnerCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isSearchingMy, setIsSearchingMy] = useState(false);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Personalization
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  // Debounced city search
  const debouncedSearchMy = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setMyCitySuggestions([]);
        setIsSearchingMy(false);
        return;
      }
      setIsSearchingMy(true);
      const suggestions = await searchCities(query);
      setMyCitySuggestions(suggestions);
      setIsSearchingMy(false);
    }, 500)
  ).current;

  const debouncedSearchPartner = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setPartnerCitySuggestions([]);
        setIsSearchingPartner(false);
        return;
      }
      setIsSearchingPartner(true);
      const suggestions = await searchCities(query);
      setPartnerCitySuggestions(suggestions);
      setIsSearchingPartner(false);
    }, 500)
  ).current;

  const handleMyCityChange = (text: string) => {
    setMyCity(text);
    if (text.trim() && text.length >= 2) {
      debouncedSearchMy(text);
    } else {
      setMyCitySuggestions([]);
      setIsSearchingMy(false);
    }
  };

  const handlePartnerCityChange = (text: string) => {
    setPartnerCity(text);
    if (text.trim() && text.length >= 2) {
      debouncedSearchPartner(text);
    } else {
      setPartnerCitySuggestions([]);
      setIsSearchingPartner(false);
    }
  };

  const selectMyCitySuggestion = (suggestion: CitySuggestion) => {
    setMyCity(suggestion.name);
    setMyCitySuggestions([]);
    Keyboard.dismiss();
  };

  const selectPartnerCitySuggestion = (suggestion: CitySuggestion) => {
    setPartnerCity(suggestion.name);
    setPartnerCitySuggestions([]);
    Keyboard.dismiss();
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const result = await autoDetectCity();
      if (result) {
        setMyCity(result.city);
      }
    } catch (error) {
      console.error('[OnboardingFlow] Auto-detect failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleComplete = () => {
    const coupleNames =
      myName.trim() && partnerName.trim()
        ? { myName: myName.trim(), partnerName: partnerName.trim() }
        : undefined;

    onComplete({
      myCity,
      partnerCity,
      useCase,
      displayMode,
      coupleNames,
    });
  };

  const getProgress = () => {
    const steps: Step[] = ['welcome', 'purpose', 'location-you', 'location-partner', 'display', 'personalize'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Render functions for each step
  const renderWelcome = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerContent}>
          {/* Aura Logo with elegant presentation */}
          <View style={styles.welcomeLogoContainer}>
            <View style={styles.welcomeGlow}>
              <View style={styles.welcomeGlowOuter} />
            </View>
            <View style={styles.welcomeGlow}>
              <View style={styles.welcomeGlowInner} />
            </View>
            <View style={styles.welcomeLogoWrapper}>
              <AuraLogo size={140} />
            </View>
          </View>

          <Text style={styles.welcomeTitle}>Aura</Text>
          <Text style={styles.welcomeSubtitle}>
            Your shared atmosphere{'\n'}across the distance
          </Text>

          <View style={styles.featureList}>
            <FeatureItem text="Blend two skies into one living atmosphere" />
            <FeatureItem text="See their weather and time in real-time" />
            <FeatureItem text="Feel the connection across any distance" />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('purpose')}
          >
            <LinearGradient
              colors={['#06b6d4', '#a78bfa', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Begin</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderPurpose = () => (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>What brings you here?</Text>
        <Text style={styles.stepSubtitle}>
          Help us personalize your experience
        </Text>

        <View style={styles.useCaseGrid}>
          {USE_CASES.map((item) => {
            const Icon = item.icon;
            const isSelected = useCase === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.useCaseCard, isSelected && styles.useCaseCardSelected]}
                onPress={() => setUseCase(item.id)}
              >
                <View style={[styles.useCaseIcon, { backgroundColor: `${item.color}15` }]}>
                  <Icon size={28} color={item.color} />
                </View>
                <Text style={styles.useCaseLabel}>{item.label}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: item.color }]}>
                    <Check size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !useCase && styles.buttonDisabled]}
          onPress={() => setStep('location-you')}
          disabled={!useCase}
        >
          <LinearGradient
            colors={useCase ? ['#06b6d4', '#a78bfa'] : ['#475569', '#475569']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  const renderLocationYou = () => (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.locationHeader}>
            <View style={[styles.locationMarker, { backgroundColor: '#06b6d4' }]}>
              <MapPin size={24} color="white" />
            </View>
            <Text style={styles.stepTitle}>Where are you?</Text>
            <Text style={styles.stepSubtitle}>Let's start with your location</Text>
          </View>

          {/* Auto-detect button */}
          <TouchableOpacity
            style={styles.autoDetectButton}
            onPress={handleAutoDetect}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <ActivityIndicator size="small" color="#06b6d4" />
            ) : (
              <MapPin size={20} color="#06b6d4" />
            )}
            <Text style={styles.autoDetectText}>
              {isDetecting ? 'Detecting...' : 'Auto-detect my location'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or enter manually</Text>

          {/* City input with autocomplete */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your city... (e.g., Taipei)"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={myCity}
              onChangeText={handleMyCityChange}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {isSearchingMy && (
              <View style={styles.inputIcon}>
                <ActivityIndicator size="small" color="#06b6d4" />
              </View>
            )}
          </View>

          {/* Suggestions */}
          {myCitySuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <BlurView intensity={80} tint="dark" style={styles.suggestionsBlur}>
                <FlatList
                  data={myCitySuggestions}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectMyCitySuggestion(item)}
                    >
                      <MapPin size={14} color="#06b6d4" />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionName}>{item.name}</Text>
                        <Text style={styles.suggestionCountry}>{item.country}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </BlurView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, !myCity && styles.buttonDisabled]}
            onPress={() => setStep('location-partner')}
            disabled={!myCity}
          >
            <LinearGradient
              colors={myCity ? ['#06b6d4', '#a78bfa'] : ['#475569', '#475569']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  const renderLocationPartner = () => (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.locationHeader}>
            <View style={[styles.locationMarker, { backgroundColor: '#ec4899' }]}>
              <MapPin size={24} color="white" />
            </View>
            <Text style={styles.stepTitle}>Where's your person?</Text>
            <Text style={styles.stepSubtitle}>Now let's connect to their sky</Text>
          </View>

          {/* City input with autocomplete */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type their city... (e.g., Tokyo)"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={partnerCity}
              onChangeText={handlePartnerCityChange}
              autoCapitalize="words"
              returnKeyType="done"
            />
            {isSearchingPartner && (
              <View style={styles.inputIcon}>
                <ActivityIndicator size="small" color="#ec4899" />
              </View>
            )}
          </View>

          {/* Suggestions */}
          {partnerCitySuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <BlurView intensity={80} tint="dark" style={styles.suggestionsBlur}>
                <FlatList
                  data={partnerCitySuggestions}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectPartnerCitySuggestion(item)}
                    >
                      <MapPin size={14} color="#ec4899" />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionName}>{item.name}</Text>
                        <Text style={styles.suggestionCountry}>{item.country}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </BlurView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, !partnerCity && styles.buttonDisabled]}
            onPress={() => setStep('display')}
            disabled={!partnerCity}
          >
            <LinearGradient
              colors={partnerCity ? ['#ec4899', '#a78bfa'] : ['#475569', '#475569']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  const renderDisplay = () => (
    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>How much do you want to see?</Text>
        <Text style={styles.stepSubtitle}>You can change this anytime in settings</Text>

        <View style={styles.displayModeList}>
          {DISPLAY_MODES.map((mode) => {
            const isSelected = displayMode === mode.id;

            return (
              <TouchableOpacity
                key={mode.id}
                style={[styles.displayModeCard, isSelected && styles.displayModeCardSelected]}
                onPress={() => setDisplayMode(mode.id)}
              >
                <View style={styles.displayModeHeader}>
                  <Text style={styles.displayModeLabel}>{mode.label}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Check size={14} color="white" />
                    </View>
                  )}
                </View>
                <Text style={styles.displayModeDescription}>{mode.description}</Text>
                <View style={styles.displayModeFeatures}>
                  {mode.features.map((feature, index) => (
                    <Text key={index} style={styles.displayModeFeature}>
                      • {feature}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep('personalize')}
        >
          <LinearGradient
            colors={['#06b6d4', '#a78bfa', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  const renderPersonalize = () => (
    <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.stepContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Add a personal touch</Text>
        <Text style={styles.stepSubtitle}>Optional but makes it feel more yours</Text>

        <View style={styles.personalizationContainer}>
          <View style={styles.personRow}>
            <Text style={styles.personLabel}>You</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Your name..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={myName}
              onChangeText={setMyName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.personRow}>
            <Text style={styles.personLabel}>Them</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Their name..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={partnerName}
              onChangeText={setPartnerName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
        >
          <LinearGradient
            colors={['#06b6d4', '#a78bfa', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Complete Setup</Text>
            <Check size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleComplete}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {step === 'welcome' && renderWelcome()}
        {step === 'purpose' && renderPurpose()}
        {step === 'location-you' && renderLocationYou()}
        {step === 'location-partner' && renderLocationPartner()}
        {step === 'display' && renderDisplay()}
        {step === 'personalize' && renderPersonalize()}
      </View>
    </LinearGradient>
  );
}

// Helper component
function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: SCREEN_HEIGHT * 0.8, // Ensure proper centering
  },

  // Welcome screen - Premium Logo presentation
  welcomeLogoContainer: {
    position: 'relative',
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeGlow: {
    position: 'absolute',
  },
  welcomeGlowOuter: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    // Subtle blur effect simulation
    opacity: 0.6,
  },
  welcomeGlowInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
    opacity: 0.8,
  },
  welcomeLogoWrapper: {
    zIndex: 10,
    // Premium shadow for depth
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  welcomeTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 48,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  featureList: {
    gap: 20,
    marginBottom: 48,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },

  // Step screens
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    marginTop: 20,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 32,
  },

  // Use case selection - Premium card design
  useCaseGrid: {
    gap: 18,
    marginBottom: 32,
  },
  useCaseCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    // Premium depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  useCaseCardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.6)',
    borderWidth: 3,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  useCaseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  useCaseLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Location screens - Premium design
  locationHeader: {
    alignItems: 'center',
    marginBottom: 36,
  },
  locationMarker: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    // Premium depth with glow effect
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    marginBottom: 20,
    // Premium glassmorphism
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  autoDetectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
  },
  orText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  textInput: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    fontSize: 17,
    color: 'white',
    fontWeight: '500',
    // Premium glassmorphism
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: -16,
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
    maxHeight: 200,
  },
  suggestionsBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  suggestionCountry: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Display mode selection - Premium card design
  displayModeList: {
    gap: 18,
    marginBottom: 32,
  },
  displayModeCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  displayModeCardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.6)',
    borderWidth: 3,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  displayModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  displayModeLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  displayModeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  displayModeFeatures: {
    gap: 6,
  },
  displayModeFeature: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Personalization
  personalizationContainer: {
    gap: 20,
    marginBottom: 32,
  },
  personRow: {
    gap: 12,
  },
  personLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  nameInput: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    fontSize: 16,
    color: 'white',
  },

  // Buttons - Premium glassmorphism design
  primaryButton: {
    borderRadius: 20,
    overflow: 'visible',
    marginTop: 'auto',
    // Elevated shadow for depth
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 20,
    // Subtle inner border for premium feel
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    flexShrink: 0,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});
