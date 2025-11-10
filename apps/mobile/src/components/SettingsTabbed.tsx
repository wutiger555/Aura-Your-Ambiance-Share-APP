import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Palette, MapPin, Calendar, Info } from 'lucide-react-native';
import { LocationData, WeatherData, DailySchedule } from '@aura/shared';
import { useDisplaySettings, AppearanceMode } from '../stores/useDisplaySettings';

// Import existing components
import DailyRhythmEditor from './aura/DailyRhythmEditor';
// We'll need to create simplified sub-components for Connection tab

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SettingsTabbedProps {
  visible: boolean;
  onClose: () => void;
  onReset: () => void;
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  mySchedule: DailySchedule | null;
  partnerSchedule: DailySchedule | null;
  onUpdateNicknames?: (myNickname: string, partnerNickname: string) => void;
  onUpdateSchedules?: (mySchedule: DailySchedule, partnerSchedule: DailySchedule) => void;
}

type Tab = 'display' | 'connection' | 'schedule' | 'about';

/**
 * SettingsTabbed - Reorganized settings with tab navigation
 * v2.6.0: Cleaner organization for better user experience
 *
 * Tabs:
 * 1. Display: Appearance mode and element toggles
 * 2. Connection: Map, distance, flight info, nicknames
 * 3. Schedule: Daily Rhythm editor access
 * 4. About: CO₂, attributions, version
 */
export default function SettingsTabbed({
  visible,
  onClose,
  onReset,
  myLocation,
  partnerLocation,
  myWeather,
  partnerWeather,
  mySchedule,
  partnerSchedule,
  onUpdateNicknames,
  onUpdateSchedules,
}: SettingsTabbedProps) {
  const [activeTab, setActiveTab] = useState<Tab>('display');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRhythmEditor, setShowRhythmEditor] = useState(false);

  // Display settings from Zustand store
  const {
    appearanceMode,
    showMilestones,
    showWeatherReminders,
    showProfileInfo,
    showSunTimes,
    showTimeStatus,
    showStatusMessages,
    showHeartlineInfo,
    setAppearanceMode,
    toggleElement,
    resetToDefaults,
  } = useDisplaySettings();

  // Default schedule
  const defaultSchedule: DailySchedule = {
    sleep: { start: 23, end: 7 },
    work: { start: 9, end: 18 },
    busy: [],
  };

  const handleScheduleSave = (newMySchedule: DailySchedule, newPartnerSchedule: DailySchedule) => {
    if (onUpdateSchedules) {
      onUpdateSchedules(newMySchedule, newPartnerSchedule);
    }
    setShowRhythmEditor(false);
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    onReset();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <LinearGradient
        colors={['#0a0118', '#1a1230', '#1e1b4b', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <BlurView intensity={30} tint="dark" style={styles.closeButtonBlur}>
              <X size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'display' && styles.tabActive]}
            onPress={() => setActiveTab('display')}
          >
            <Palette size={18} color={activeTab === 'display' ? '#a78bfa' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'display' && styles.tabTextActive]}>
              Display
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'connection' && styles.tabActive]}
            onPress={() => setActiveTab('connection')}
          >
            <MapPin size={18} color={activeTab === 'connection' ? '#a78bfa' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'connection' && styles.tabTextActive]}>
              Connection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'schedule' && styles.tabActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <Calendar size={18} color={activeTab === 'schedule' ? '#a78bfa' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'schedule' && styles.tabTextActive]}>
              Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Info size={18} color={activeTab === 'about' ? '#a78bfa' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Display Tab */}
          {activeTab === 'display' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Appearance Mode</Text>
              <View style={styles.modeSelector}>
                {(['minimal', 'balanced', 'detailed'] as AppearanceMode[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.modeButton, appearanceMode === mode && styles.modeButtonActive]}
                    onPress={() => setAppearanceMode(mode)}
                  >
                    <Text style={[styles.modeButtonText, appearanceMode === mode && styles.modeButtonTextActive]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                    <Text style={styles.modeButtonHint}>
                      {mode === 'minimal' && '(Cleanest)'}
                      {mode === 'balanced' && '(Recommended)'}
                      {mode === 'detailed' && '(Full info)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Custom Elements</Text>
              <Text style={styles.sectionHint}>Fine-tune what's shown on the main screen</Text>

              <View style={styles.toggleList}>
                <ToggleItem
                  label="Relationship milestones"
                  value={showMilestones}
                  onToggle={() => toggleElement('showMilestones')}
                />
                <ToggleItem
                  label="Weather reminders"
                  value={showWeatherReminders}
                  onToggle={() => toggleElement('showWeatherReminders')}
                />
                <ToggleItem
                  label="Profile names & emojis"
                  value={showProfileInfo}
                  onToggle={() => toggleElement('showProfileInfo')}
                />
                <ToggleItem
                  label="Sunrise/sunset times"
                  value={showSunTimes}
                  onToggle={() => toggleElement('showSunTimes')}
                />
                <ToggleItem
                  label="Time status icons"
                  value={showTimeStatus}
                  onToggle={() => toggleElement('showTimeStatus')}
                />
                <ToggleItem
                  label="Status messages"
                  value={showStatusMessages}
                  onToggle={() => toggleElement('showStatusMessages')}
                />
                <ToggleItem
                  label="Heartline distance/time"
                  value={showHeartlineInfo}
                  onToggle={() => toggleElement('showHeartlineInfo')}
                />
              </View>

              <TouchableOpacity
                style={styles.resetDisplayButton}
                onPress={resetToDefaults}
              >
                <Text style={styles.resetDisplayText}>Reset to Minimal Defaults</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Your Connection</Text>
              <Text style={styles.placeholder}>
                Map and connection info will be shown here
                {'\n'}(Coming from existing Settings component)
              </Text>
              <Text style={styles.infoText}>
                • World map with flight path{'\n'}
                • Distance and flight time{'\n'}
                • Airport codes{'\n'}
                • Location nickname editing
              </Text>
            </View>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Daily Rhythms</Text>
              <Text style={styles.sectionHint}>
                Set your daily schedules to find the best times to connect
              </Text>

              <TouchableOpacity
                style={styles.rhythmButton}
                onPress={() => setShowRhythmEditor(true)}
              >
                <BlurView intensity={60} tint="dark" style={styles.rhythmButtonBlur}>
                  <Calendar size={20} color="#a78bfa" />
                  <View style={styles.rhythmButtonText}>
                    <Text style={styles.rhythmButtonTitle}>Edit Daily Rhythms</Text>
                    <Text style={styles.rhythmButtonHint}>
                      {mySchedule && partnerSchedule
                        ? 'Schedules configured'
                        : 'Not set up yet'}
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>

              {mySchedule && partnerSchedule && (
                <View style={styles.schedulePreview}>
                  <Text style={styles.schedulePreviewTitle}>Quick Preview</Text>
                  <Text style={styles.schedulePreviewText}>
                    Your sleep: {mySchedule.sleep.start}:00 - {mySchedule.sleep.end}:00
                  </Text>
                  <Text style={styles.schedulePreviewText}>
                    Partner sleep: {partnerSchedule.sleep.start}:00 - {partnerSchedule.sleep.end}:00
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>About Aura</Text>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>2.6.0 - Minimalist Redesign</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Data Sources</Text>
                <Text style={styles.aboutText}>
                  • OpenStreetMap (Nominatim){'\n'}
                  • Open-Meteo Weather API
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Design Philosophy</Text>
                <Text style={styles.aboutText}>
                  Aura transforms weather and time into a shared visual experience for long-distance couples.
                  The minimalist design prioritizes emotional resonance over functional complexity.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Environmental Impact</Text>
                <Text style={styles.aboutText}>
                  Estimated CO₂ emissions for a round-trip flight between your locations are shown to encourage
                  mindful travel decisions.
                </Text>
              </View>
            </View>
          )}

          {/* Reset Button (always visible at bottom) */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setShowResetConfirm(true)}
          >
            <BlurView intensity={30} tint="dark" style={styles.resetButtonBlur}>
              <Text style={styles.resetButtonText}>Reset Connection</Text>
              <Text style={styles.resetButtonHint}>Clear all data and start over</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <View style={styles.confirmOverlay}>
            <BlurView intensity={90} tint="dark" style={styles.confirmBlur}>
              <View style={styles.confirmModal}>
                <Text style={styles.confirmTitle}>Reset Connection?</Text>
                <Text style={styles.confirmMessage}>
                  This will clear all locations, schedules, and personalization. You'll return to the intro screen.
                </Text>

                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={styles.confirmButtonCancel}
                    onPress={() => setShowResetConfirm(false)}
                  >
                    <Text style={styles.confirmButtonCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButtonReset}
                    onPress={handleReset}
                  >
                    <Text style={styles.confirmButtonResetText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        )}

        {/* Daily Rhythm Editor Modal */}
        <DailyRhythmEditor
          visible={showRhythmEditor}
          onClose={() => setShowRhythmEditor(false)}
          mySchedule={mySchedule || defaultSchedule}
          partnerSchedule={partnerSchedule || defaultSchedule}
          onSave={handleScheduleSave}
          myName={myLocation?.name || 'You'}
          partnerName={partnerLocation?.name || 'Partner'}
        />
      </LinearGradient>
    </Modal>
  );
}

// Toggle Item Component
function ToggleItem({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleItem}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#334155', true: '#a78bfa' }}
        thumbColor={value ? '#ffffff' : '#94a3b8'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  tabText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  // Mode Selector
  modeSelector: {
    gap: 10,
    marginBottom: 20,
  },
  modeButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderColor: '#a78bfa',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modeButtonTextActive: {
    color: '#a78bfa',
  },
  modeButtonHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  // Toggle List
  toggleList: {
    gap: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  resetDisplayButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  resetDisplayText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  // Connection Tab
  placeholder: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginVertical: 20,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  // Schedule Tab
  rhythmButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  rhythmButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  rhythmButtonText: {
    flex: 1,
  },
  rhythmButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
  },
  rhythmButtonHint: {
    fontSize: 12,
    color: 'rgba(167, 139, 250, 0.6)',
    marginTop: 2,
  },
  schedulePreview: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 8,
  },
  schedulePreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  schedulePreviewText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  // About Tab
  aboutSection: {
    marginBottom: 20,
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aboutValue: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  // Reset Button
  resetButton: {
    marginTop: 30,
    borderRadius: 14,
    overflow: 'hidden',
  },
  resetButtonBlur: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  resetButtonHint: {
    fontSize: 12,
    color: 'rgba(239, 68, 68, 0.6)',
    marginTop: 2,
  },
  // Confirm Modal
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  confirmBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    width: SCREEN_WIDTH - 60,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButtonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  confirmButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  confirmButtonReset: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmButtonResetText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
