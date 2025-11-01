import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, AlertCircle, Clock, MapPin, Edit2, Save } from 'lucide-react-native';
import { LocationData, WeatherData } from '@aura/shared';
import { getDSTInfo, formatDSTStatus } from '../utils/dstUtils';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
  onReset: () => void;
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  onUpdateNicknames?: (myNickname: string, partnerNickname: string) => void;
}

export default function Settings({
  visible,
  onClose,
  onReset,
  myLocation,
  partnerLocation,
  myWeather,
  partnerWeather,
  onUpdateNicknames,
}: SettingsProps) {
  const [myNickname, setMyNickname] = useState(myLocation?.nickname || '');
  const [partnerNickname, setPartnerNickname] = useState(partnerLocation?.nickname || '');
  const [isEditingMy, setIsEditingMy] = useState(false);
  const [isEditingPartner, setIsEditingPartner] = useState(false);

  // Get DST information for both locations
  const myDSTInfo = useMemo(() => {
    if (!myWeather?.timezone) return null;
    return getDSTInfo(myWeather.timezone);
  }, [myWeather?.timezone]);

  const partnerDSTInfo = useMemo(() => {
    if (!partnerWeather?.timezone) return null;
    return getDSTInfo(partnerWeather.timezone);
  }, [partnerWeather?.timezone]);

  // Check if any location has an upcoming DST transition
  const hasUpcomingTransition = myDSTInfo?.transitionWarning || partnerDSTInfo?.transitionWarning;

  const handleSaveNicknames = () => {
    if (onUpdateNicknames) {
      onUpdateNicknames(myNickname.trim(), partnerNickname.trim());
    }
    setIsEditingMy(false);
    setIsEditingPartner(false);
    Alert.alert('Saved', 'Nicknames updated successfully!');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          {/* This is the main sheet container with a bounded height */}
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* The ScrollView now has a parent with a fixed height and can use flex: 1 */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* DST Transition Warning */}
              {hasUpcomingTransition && (
                <View style={styles.warningBanner}>
                  <AlertCircle size={20} color="#fb923c" />
                  <View style={styles.warningTextContainer}>
                    <Text style={styles.warningTitle}>Time Change Alert</Text>
                    {myDSTInfo?.transitionWarning && (
                      <Text style={styles.warningText}>
                        Your location: {myDSTInfo.transitionWarning}
                      </Text>
                    )}
                    {partnerDSTInfo?.transitionWarning && (
                      <Text style={styles.warningText}>
                        Partner's location: {partnerDSTInfo.transitionWarning}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Custom Nicknames Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Edit2 size={18} color="#94a3b8" />
                  <Text style={styles.sectionTitle}>Custom Names</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Personalize how you see each location (e.g., "My Love", "Mom", "Best Friend")
                </Text>

                {/* My Nickname */}
                <View style={styles.nicknameCard}>
                  <View style={styles.nicknameHeader}>
                    <Text style={styles.nicknameLabel}>Your Location Name</Text>
                    <View style={[styles.locationBadge, styles.myBadge]}>
                      <Text style={styles.badgeText}>Me</Text>
                    </View>
                  </View>
                  {isEditingMy ? (
                    <TextInput
                      style={styles.nicknameInput}
                      value={myNickname}
                      onChangeText={setMyNickname}
                      placeholder="e.g., Home, My Place"
                      placeholderTextColor="#64748b"
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.nicknameDisplay}
                      onPress={() => setIsEditingMy(true)}
                    >
                      <Text style={styles.nicknameText}>
                        {myNickname || myLocation?.name || 'Not set'}
                      </Text>
                      <Edit2 size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Partner Nickname */}
                <View style={styles.nicknameCard}>
                  <View style={styles.nicknameHeader}>
                    <Text style={styles.nicknameLabel}>Partner's Location Name</Text>
                    <View style={[styles.locationBadge, styles.partnerBadge]}>
                      <Text style={styles.badgeText}>Partner</Text>
                    </View>
                  </View>
                  {isEditingPartner ? (
                    <TextInput
                      style={styles.nicknameInput}
                      value={partnerNickname}
                      onChangeText={setPartnerNickname}
                      placeholder="e.g., My Love, Mom, Best Friend"
                      placeholderTextColor="#64748b"
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.nicknameDisplay}
                      onPress={() => setIsEditingPartner(true)}
                    >
                      <Text style={styles.nicknameText}>
                        {partnerNickname || partnerLocation?.name || 'Not set'}
                      </Text>
                      <Edit2 size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>

                {(isEditingMy || isEditingPartner) && (
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveNicknames}>
                    <Save size={16} color="white" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Location Information */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MapPin size={18} color="#94a3b8" />
                  <Text style={styles.sectionTitle}>Locations</Text>
                </View>

                {/* My Location */}
                {myLocation && (
                  <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <Text style={styles.locationLabel}>Your Location</Text>
                      <View style={[styles.locationBadge, styles.myBadge]}>
                        <Text style={styles.badgeText}>Me</Text>
                      </View>
                    </View>
                    <Text style={styles.locationName}>{myLocation.name}</Text>
                    <Text style={styles.locationCoords}>
                      {myLocation.latitude.toFixed(4)}°, {myLocation.longitude.toFixed(4)}°
                    </Text>
                  </View>
                )}

                {/* Partner Location */}
                {partnerLocation && (
                  <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <Text style={styles.locationLabel}>Partner's Location</Text>
                      <View style={[styles.locationBadge, styles.partnerBadge]}>
                        <Text style={styles.badgeText}>Partner</Text>
                      </View>
                    </View>
                    <Text style={styles.locationName}>{partnerLocation.name}</Text>
                    <Text style={styles.locationCoords}>
                      {partnerLocation.latitude.toFixed(4)}°, {partnerLocation.longitude.toFixed(4)}°
                    </Text>
                  </View>
                )}
              </View>

              {/* Time Zone & DST Details */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={18} color="#94a3b8" />
                  <Text style={styles.sectionTitle}>Time Zone & DST Status</Text>
                </View>

                {myWeather && myDSTInfo && (
                  <View style={styles.timezoneCard}>
                    <Text style={styles.timezoneLabel}>Your Timezone</Text>
                    <Text style={styles.timezoneName}>{myWeather.timezone}</Text>
                    <View style={styles.dstInfo}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.dstText}>{formatDSTStatus(myDSTInfo)}</Text>
                    </View>
                    {myDSTInfo.standardOffset !== myDSTInfo.dstOffset && (
                      <Text style={styles.timezoneDetail}>
                        {myDSTInfo.isDST
                          ? `Currently in DST (UTC${formatOffset(myDSTInfo.dstOffset)})`
                          : `Standard Time (UTC${formatOffset(myDSTInfo.standardOffset)})`}
                      </Text>
                    )}
                  </View>
                )}

                {partnerWeather && partnerDSTInfo && (
                  <View style={styles.timezoneCard}>
                    <Text style={styles.timezoneLabel}>Partner's Timezone</Text>
                    <Text style={styles.timezoneName}>{partnerWeather.timezone}</Text>
                    <View style={styles.dstInfo}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.dstText}>{formatDSTStatus(partnerDSTInfo)}</Text>
                    </View>
                    {partnerDSTInfo.standardOffset !== partnerDSTInfo.dstOffset && (
                      <Text style={styles.timezoneDetail}>
                        {partnerDSTInfo.isDST
                          ? `Currently in DST (UTC${formatOffset(partnerDSTInfo.dstOffset)})`
                          : `Standard Time (UTC${formatOffset(partnerDSTInfo.standardOffset)})`}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                  <Text style={styles.resetButtonText}>Reset Locations</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Helper function to format UTC offset
function formatOffset(offsetMinutes: number): string {
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';

  if (minutes === 0) {
    return `${sign}${hours}`;
  }
  return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end', // Pushes modal sheet to the bottom
  },
  modalSheet: { // The container with a bounded height
    height: '95%',
    width: '100%',
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  content: {
    flex: 1, // This makes the ScrollView fill the rest of the modalSheet
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  // Warning Banner
  warningBanner: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fb923c',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#fbbf24',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },

  // Nickname Cards
  nicknameCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  nicknameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nicknameLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nicknameInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  nicknameDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nicknameText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Location Cards
  locationCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  myBadge: {
    backgroundColor: '#06b6d4',
  },
  partnerBadge: {
    backgroundColor: '#ec4899',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  locationName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 13,
    color: '#64748b',
  },

  // Timezone Cards
  timezoneCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  timezoneLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  timezoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  dstInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dstText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  timezoneDetail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },

  // Actions
  actions: {
    marginTop: 8,
    gap: 12,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
