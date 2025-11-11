import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight, Check } from 'lucide-react-native';
// import LocationInputPremium from './LocationInputPremium'; // Premium version (causes memory crashes on Simulator)
import LocationInputSimple from './LocationInputSimple'; // Simplified version (memory-safe)

interface QuickStartMapFlowProps {
  onComplete: (data: {
    myCity: string;
    partnerCity: string;
    displayMode: 'minimal' | 'cozy' | 'full';
    coupleNames?: {
      myName: string;
      partnerName: string;
      myEmoji?: string;
      partnerEmoji?: string;
    };
  }) => void;
  isReturningUser?: boolean;
}

type Step = 'location' | 'display' | 'personalize';

const DISPLAY_MODES = [
  {
    id: 'minimal' as const,
    label: 'Minimal',
    description: 'Clean & focused',
    features: ['Essential info only', 'Maximum breathing space'],
  },
  {
    id: 'cozy' as const,
    label: 'Balanced',
    description: 'Perfect harmony',
    features: ['Key information', 'Comfortable layout', 'Weather hints'],
  },
  {
    id: 'full' as const,
    label: 'Detailed',
    description: 'Everything visible',
    features: ['All information', 'Weather reminders', 'Relationship milestones'],
  },
];

const EMOJI_OPTIONS = [
  // Popular emojis
  '❤️', '💕', '💖', '💗', '💓', '💞', '💝',
  '⭐', '🌟', '✨', '💫', '🌙',
  '🌸', '🌺', '🌻', '🌷', '🌹',
  '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨',
  '🎨', '🎭', '🎪', '🎬', '🎮', '🎯',
  '☕', '🍕', '🍰', '🎂', '🍩',
];

/**
 * QuickStartMapFlow - Streamlined onboarding with premium map interface
 * v2.7.0: Uses LocationInputPremium for interactive location selection
 */
const QuickStartMapFlow: React.FC<QuickStartMapFlowProps> = ({
  onComplete,
  isReturningUser = false,
}) => {
  const [step, setStep] = useState<Step>('location');
  const [myCity, setMyCity] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [displayMode, setDisplayMode] = useState<'minimal' | 'cozy' | 'full'>('cozy');
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myEmoji, setMyEmoji] = useState('');
  const [partnerEmoji, setPartnerEmoji] = useState('');

  const handleLocationComplete = (myCityName: string, partnerCityName: string) => {
    setMyCity(myCityName);
    setPartnerCity(partnerCityName);
    setStep('display');
  };

  const handleDisplayContinue = () => {
    setStep('personalize');
  };

  const handleFinalComplete = () => {
    const coupleNames =
      myName.trim() && partnerName.trim()
        ? {
            myName: myName.trim(),
            partnerName: partnerName.trim(),
            myEmoji: myEmoji || undefined,
            partnerEmoji: partnerEmoji || undefined,
          }
        : undefined;

    onComplete({
      myCity,
      partnerCity,
      displayMode,
      coupleNames,
    });
  };

  if (step === 'location') {
    return <LocationInputSimple onComplete={handleLocationComplete} isReturningUser={isReturningUser} />;
  }

  if (step === 'display') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={styles.title}>How much do you want to see?</Text>
            <Text style={styles.subtitle}>You can change this anytime in settings</Text>

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

            <TouchableOpacity style={styles.primaryButton} onPress={handleDisplayContinue}>
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
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  if (step === 'personalize') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={styles.title}>Add a personal touch</Text>
            <Text style={styles.subtitle}>Optional but makes it feel more yours</Text>

            <View style={styles.personContainer}>
              {/* You */}
              <View style={styles.personSection}>
                <Text style={styles.personLabel}>You</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Your name..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={myName}
                  onChangeText={setMyName}
                  autoCapitalize="words"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiPicker}>
                  {EMOJI_OPTIONS.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.emojiButton, myEmoji === emoji && styles.emojiButtonSelected]}
                      onPress={() => setMyEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Partner */}
              <View style={styles.personSection}>
                <Text style={styles.personLabel}>Partner</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Partner's name..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={partnerName}
                  onChangeText={setPartnerName}
                  autoCapitalize="words"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiPicker}>
                  {EMOJI_OPTIONS.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.emojiButton, partnerEmoji === emoji && styles.emojiButtonSelected]}
                      onPress={() => setPartnerEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleFinalComplete}>
              <LinearGradient
                colors={['#06b6d4', '#a78bfa', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Journey</Text>
                <ChevronRight size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleFinalComplete}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 60 : 80,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  displayModeList: {
    gap: 12,
    marginBottom: 24,
  },
  displayModeCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  displayModeCardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.6)',
    borderWidth: 3,
  },
  displayModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  displayModeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  displayModeDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  displayModeFeatures: {
    gap: 4,
  },
  displayModeFeature: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personContainer: {
    gap: 24,
    marginBottom: 32,
  },
  personSection: {
    gap: 12,
  },
  personLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiPicker: {
    gap: 8,
    paddingVertical: 4,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
  },
  emojiText: {
    fontSize: 24,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
});

export default QuickStartMapFlow;
