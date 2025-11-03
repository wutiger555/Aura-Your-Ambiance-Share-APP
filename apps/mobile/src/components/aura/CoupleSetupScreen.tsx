import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CoupleProfile } from '@aura/shared';

interface CoupleSetupScreenProps {
  onComplete: (profile: CoupleProfile) => void;
}

export default function CoupleSetupScreen({ onComplete }: CoupleSetupScreenProps) {
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myEmoji, setMyEmoji] = useState('');
  const [partnerEmoji, setPartnerEmoji] = useState('');

  // Emoji suggestions
  const myEmojiSuggestions = ['🌸', '☀️', '🌊', '🌙', '⭐', '🦋', '🌻', '🍀'];
  const partnerEmojiSuggestions = ['🌙', '⭐', '🌹', '💫', '🦊', '🐱', '🌺', '🍁'];

  const handleContinue = () => {
    if (!myName.trim() || !partnerName.trim()) {
      // Could add error handling here
      return;
    }

    const profile: CoupleProfile = {
      myName: myName.trim(),
      partnerName: partnerName.trim(),
      myEmoji: myEmoji || '🌸', // Default emoji
      partnerEmoji: partnerEmoji || '🌙',
      connectionName: 'Our Connection', // Default
    };

    onComplete(profile);
  };

  const canContinue = myName.trim().length > 0 && partnerName.trim().length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Tell us about you two</Text>
              <Text style={styles.subtitle}>Make Aura truly yours</Text>
            </View>

            {/* My Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About You</Text>

              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                placeholder="How should we call you?"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={myName}
                onChangeText={setMyName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={styles.label}>Your emoji</Text>
              <View style={styles.emojiGrid}>
                {myEmojiSuggestions.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      myEmoji === emoji && styles.emojiButtonSelected,
                    ]}
                    onPress={() => setMyEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Partner Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Them</Text>

              <Text style={styles.label}>Your partner's name</Text>
              <TextInput
                style={styles.input}
                placeholder="What do you call them?"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={partnerName}
                onChangeText={setPartnerName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />

              <Text style={styles.label}>Their emoji</Text>
              <View style={styles.emojiGrid}>
                {partnerEmojiSuggestions.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      partnerEmoji === emoji && styles.emojiButtonSelected,
                    ]}
                    onPress={() => setPartnerEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
            >
              <LinearGradient
                colors={canContinue ? ['#06b6d4', '#3b82f6'] : ['#4b5563', '#6b7280']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.hint}>
              You can always change these later in Settings
            </Text>

            {/* Spacer for keyboard */}
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  emojiText: {
    fontSize: 28,
  },
  continueButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 16,
  },
});
