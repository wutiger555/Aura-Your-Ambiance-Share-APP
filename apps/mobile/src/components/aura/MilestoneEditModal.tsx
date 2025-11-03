import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Heart, Clock } from 'lucide-react-native';

interface MilestoneEditModalProps {
  visible: boolean;
  relationshipStart?: string;
  nextMeetingDate?: string;
  lastMetDate?: string;
  onSave: (dates: {
    relationshipStart?: string;
    nextMeetingDate?: string;
    lastMetDate?: string;
  }) => void;
  onClose: () => void;
}

export default function MilestoneEditModal({
  visible,
  relationshipStart,
  nextMeetingDate,
  lastMetDate,
  onSave,
  onClose,
}: MilestoneEditModalProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showNextPicker, setShowNextPicker] = useState(false);
  const [showLastPicker, setShowLastPicker] = useState(false);

  const [startDate, setStartDate] = useState(
    relationshipStart ? new Date(relationshipStart) : new Date()
  );
  const [nextDate, setNextDate] = useState(
    nextMeetingDate ? new Date(nextMeetingDate) : new Date()
  );
  const [lastDate, setLastDate] = useState(
    lastMetDate ? new Date(lastMetDate) : new Date()
  );

  const [hasStart, setHasStart] = useState(!!relationshipStart);
  const [hasNext, setHasNext] = useState(!!nextMeetingDate);
  const [hasLast, setHasLast] = useState(!!lastMetDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = () => {
    onSave({
      relationshipStart: hasStart ? startDate.toISOString() : undefined,
      nextMeetingDate: hasNext ? nextDate.toISOString() : undefined,
      lastMetDate: hasLast ? lastDate.toISOString() : undefined,
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setStartDate(relationshipStart ? new Date(relationshipStart) : new Date());
    setNextDate(nextMeetingDate ? new Date(nextMeetingDate) : new Date());
    setLastDate(lastMetDate ? new Date(lastMetDate) : new Date());
    setHasStart(!!relationshipStart);
    setHasNext(!!nextMeetingDate);
    setHasLast(!!lastMetDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['#1e1b4b', '#312e81', '#1e293b']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Relationship Milestones</Text>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Relationship Start Date */}
                <View style={styles.dateSection}>
                  <View style={styles.dateSectionHeader}>
                    <View style={styles.iconCircle}>
                      <Heart size={18} color="#f472b6" fill="#f472b6" />
                    </View>
                    <Text style={styles.sectionTitle}>Relationship Start</Text>
                  </View>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, hasStart && styles.toggleButtonActive]}
                      onPress={() => setHasStart(!hasStart)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {hasStart ? 'Enabled' : 'Not Set'}
                      </Text>
                    </TouchableOpacity>
                    {hasStart && (
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartPicker(true)}
                      >
                        <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Next Meeting Date */}
                <View style={styles.dateSection}>
                  <View style={styles.dateSectionHeader}>
                    <View style={styles.iconCircle}>
                      <Calendar size={18} color="#06b6d4" />
                    </View>
                    <Text style={styles.sectionTitle}>Next Meeting</Text>
                  </View>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, hasNext && styles.toggleButtonActive]}
                      onPress={() => setHasNext(!hasNext)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {hasNext ? 'Enabled' : 'Not Set'}
                      </Text>
                    </TouchableOpacity>
                    {hasNext && (
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowNextPicker(true)}
                      >
                        <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.dateButtonText}>{formatDate(nextDate)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Last Met Date */}
                <View style={styles.dateSection}>
                  <View style={styles.dateSectionHeader}>
                    <View style={styles.iconCircle}>
                      <Clock size={18} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                    <Text style={styles.sectionTitle}>Last Met</Text>
                  </View>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, hasLast && styles.toggleButtonActive]}
                      onPress={() => setHasLast(!hasLast)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {hasLast ? 'Enabled' : 'Not Set'}
                      </Text>
                    </TouchableOpacity>
                    {hasLast && (
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowLastPicker(true)}
                      >
                        <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.dateButtonText}>{formatDate(lastDate)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <LinearGradient
                    colors={['#06b6d4', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Date Pickers */}
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}

              {showNextPicker && (
                <DateTimePicker
                  value={nextDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowNextPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setNextDate(selectedDate);
                    }
                  }}
                />
              )}

              {showLastPicker && (
                <DateTimePicker
                  value={lastDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowLastPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setLastDate(selectedDate);
                    }
                  }}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  toggleButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  saveButton: {
    // Gradient will be inside
  },
  saveButtonGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
