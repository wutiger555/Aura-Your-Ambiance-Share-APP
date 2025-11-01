import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, MapPin } from 'lucide-react-native';
import { ANIMATION_DURATIONS, MARKER_CONFIG, STARRY_CONFIG } from '../../constants/Animations';
import { generateStars } from '../../utils/animationUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * AnimatedStar - Individual star with twinkling and drifting
 */
interface AnimatedStarProps {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
}

const AnimatedStar: React.FC<AnimatedStarProps> = ({ x, y, size, baseOpacity }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Randomized delays for natural effect
    const twinkleDelay = Math.random() * 2000;
    const driftDelay = Math.random() * 1000;

    // Fade in initially
    opacity.value = withDelay(
      twinkleDelay,
      withTiming(baseOpacity, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    // Continuous twinkling (opacity variation)
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(baseOpacity * 0.3, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(baseOpacity, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    }, twinkleDelay + 800);

    // Gentle vertical drift
    setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-15, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        false
      );
    }, driftDelay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
};

interface LocationInputScreenProps {
  step: 'my' | 'partner';
  onSubmit: (city: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  city: string; // New prop for controlled component
  onCityChange: (text: string) => void; // New prop for controlled component
}

/**
 * LocationInputScreen - Elegant location entry experience
 *
 * Design Philosophy:
 * - Each input is a ritual, not a form
 * - Contextual copy explains the "why"
 * - Animated markers represent the connection being built
 * - Minimalist but with rich micro-interactions
 *
 * Animation Sequence:
 * 0-0.8s:   Screen fades in
 * 0.5-1.5s: Marker appears with bounce
 * 1-2s:     Text flows upward
 * 1.5-2.5s: Input field reveals with glow
 * Ongoing:  Marker pulses subtly
 */
const LocationInputScreen: React.FC<LocationInputScreenProps> = ({
  step,
  onSubmit,
  isLoading,
  error,
  city,
  onCityChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const markerOpacity = useSharedValue(0);
  const markerScale = useSharedValue(0);
  const markerPulse = useSharedValue(1);
  const inputGlow = useSharedValue(0);

  // Generate starry background
  const stars = useMemo(
    () => generateStars(STARRY_CONFIG.STAR_COUNT, SCREEN_WIDTH, SCREEN_HEIGHT),
    []
  );

  // Color based on step
  const markerColor = step === 'my' ? MARKER_CONFIG.MY_COLOR : MARKER_CONFIG.PARTNER_COLOR;
  const accentColor = step === 'my' ? '#06b6d4' : '#ec4899'; // cyan vs pink

  useEffect(() => {
    // Reset marker on step change
    markerOpacity.value = 0;
    markerScale.value = 0;

    // Marker entrance animation (0.2-1s - faster for smoother transition)
    markerOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );

    markerScale.value = withDelay(
      200,
      withSequence(
        withTiming(1.3, {
          duration: 500,
          easing: Easing.out(Easing.back(1.8)),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        })
      )
    );

    // Subtle continuous pulse (starts after entrance)
    setTimeout(() => {
      markerPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    }, 1000);
    
    // Delay focus to allow screen transition to complete
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1500); // Increased delay to account for animations

    return () => clearTimeout(focusTimer);
  }, [step]);

  // Input focus glow effect
  useEffect(() => {
    inputGlow.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isFocused]);

  const markerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: markerOpacity.value,
    transform: [{ scale: markerScale.value }],
  }));

  const markerPulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markerPulse.value }],
  }));

  const inputGlowStyle = useAnimatedStyle(() => ({
    opacity: inputGlow.value * 0.4,
  }));

  const handleSubmit = async () => {
    if (!city.trim() || isLoading) return;

    Keyboard.dismiss();
    await onSubmit(city.trim());
  };

  // Copy based on step
  const title = step === 'my' ? 'Where are you?' : 'Where are they?';
  const subtitle =
    step === 'my'
      ? 'Your location grounds the shared sky'
      : 'Their location completes the connection';
  const placeholder = step === 'my' ? 'Your city...' : 'Their city...';

  return (
    <View style={styles.container}>
      {/* Gradient background - consistent with IntroScreen */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated starry background with twinkling and drifting */}
      <View style={StyleSheet.absoluteFill}>
        {stars.map((star) => (
          <AnimatedStar
            key={star.id}
            x={star.x}
            y={star.y}
            size={star.size}
            baseOpacity={star.opacity * 0.5}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Progress indicator */}
        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: step === 'my' ? '50%' : '100%', backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step {step === 'my' ? '1' : '2'} of 2</Text>
        </Animated.View>

        {/* Animated marker */}
        <Animated.View style={[styles.markerContainer, markerAnimatedStyle]}>
          <Animated.View style={markerPulseAnimatedStyle}>
            <View style={[styles.markerDot, { backgroundColor: markerColor }]} />
          </Animated.View>
          <View style={[styles.markerRing, { borderColor: markerColor }]} />
          <View style={[styles.markerRing, styles.markerRingOuter, { borderColor: markerColor }]} />
        </Animated.View>

        {/* Title & subtitle */}
        <Animated.View entering={FadeInUp.delay(1000).duration(1000)}>
          <Text style={styles.title}>{title}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1200).duration(1000)}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        {/* Input field with glow */}
        <Animated.View
          entering={FadeInUp.delay(1500).duration(1000)}
          style={styles.inputContainer}
        >
          {/* Glow effect when focused */}
          <Animated.View
            style={[
              styles.inputGlow,
              inputGlowStyle,
              { shadowColor: accentColor, borderColor: accentColor },
            ]}
          />

          <View style={[styles.inputWrapper, isFocused && { borderColor: accentColor }]}>
            <MapPin size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#64748b"
              value={city}
              onChangeText={onCityChange}
              onSubmitEditing={handleSubmit}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              editable={!isLoading}
            />
          </View>

          {/* Error message */}
          {error && (
            <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOut.duration(200)}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Submit button */}
        <Animated.View entering={FadeInUp.delay(1800).duration(1000)} style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: accentColor },
              (!city.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!city.trim() || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {step === 'my' ? 'Continue' : 'Complete Connection'}
                </Text>
                <ArrowRight size={20} color="white" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Hint text */}
        <Animated.View entering={FadeIn.delay(2000).duration(1200)}>
          <Text style={styles.hintText}>
            {step === 'my'
              ? 'e.g., Tokyo, London, New York'
              : 'Their current location or home city'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: SCREEN_HEIGHT * 0.12,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 100,
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(100, 116, 139, 0.3)', // slate-500 with opacity
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
    fontWeight: '500',
  },
  markerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  markerRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.4,
  },
  markerRingOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    opacity: 0.2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1', // slate-300
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  inputGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // slate-800 with transparency
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 0.8)', // slate-700
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 18 : 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
  },
  errorText: {
    color: '#f87171', // red-400
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#64748b', // slate-500
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default LocationInputScreen;
