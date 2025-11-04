import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { X, Moon, Sun, GraduationCap, Briefcase, Home, Edit2, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DailySchedule {
  sleep: { start: number; end: number }; // 0-24 hours
  work: { start: number; end: number } | null;
  busy: { start: number; end: number }[]; // Multiple busy periods
}

interface DailyRhythmEditorProps {
  visible: boolean;
  onClose: () => void;
  mySchedule: DailySchedule;
  partnerSchedule: DailySchedule;
  onSave: (mySchedule: DailySchedule, partnerSchedule: DailySchedule) => void;
  myName: string;
  partnerName: string;
}

type ScheduleTemplate = {
  name: string;
  icon: React.ReactNode;
  sleep: { start: number; end: number };
  work: { start: number; end: number } | null;
  busy: { start: number; end: number }[];
};

const TEMPLATES: ScheduleTemplate[] = [
  {
    name: 'Student',
    icon: <GraduationCap size={20} color="white" />,
    sleep: { start: 23, end: 7 },
    work: { start: 8, end: 17 },
    busy: [],
  },
  {
    name: 'Office',
    icon: <Briefcase size={20} color="white" />,
    sleep: { start: 23, end: 7 },
    work: { start: 9, end: 18 },
    busy: [],
  },
  {
    name: 'Night Owl',
    icon: <Moon size={20} color="white" />,
    sleep: { start: 2, end: 10 },
    work: { start: 11, end: 20 },
    busy: [],
  },
  {
    name: 'Early Bird',
    icon: <Sun size={20} color="white" />,
    sleep: { start: 21, end: 5 },
    work: { start: 6, end: 15 },
    busy: [],
  },
  {
    name: 'Flexible',
    icon: <Home size={20} color="white" />,
    sleep: { start: 0, end: 8 },
    work: null,
    busy: [],
  },
];

/**
 * DailyRhythmEditor - Interactive 24-hour timeline editor
 *
 * Features:
 * - Circular 24-hour clock visualization
 * - Drag to set sleep/work/busy times
 * - Template quick selection
 * - Real-time overlap detection
 * - Shows best time to connect
 */
export default function DailyRhythmEditor({
  visible,
  onClose,
  mySchedule: initialMySchedule,
  partnerSchedule: initialPartnerSchedule,
  onSave,
  myName,
  partnerName,
}: DailyRhythmEditorProps) {
  const [mySchedule, setMySchedule] = useState<DailySchedule>(initialMySchedule);
  const [partnerSchedule, setPartnerSchedule] = useState<DailySchedule>(initialPartnerSchedule);
  const [editingField, setEditingField] = useState<{
    person: 'my' | 'partner';
    type: 'sleep' | 'work';
    field: 'start' | 'end';
  } | null>(null);

  const handleTemplateSelect = (person: 'my' | 'partner', template: ScheduleTemplate) => {
    const schedule: DailySchedule = {
      sleep: template.sleep,
      work: template.work,
      busy: template.busy,
    };

    if (person === 'my') {
      setMySchedule(schedule);
    } else {
      setPartnerSchedule(schedule);
    }
  };

  const handleTimeEdit = (person: 'my' | 'partner', type: 'sleep' | 'work', field: 'start' | 'end', value: number) => {
    const schedule = person === 'my' ? mySchedule : partnerSchedule;
    const setSchedule = person === 'my' ? setMySchedule : setPartnerSchedule;

    if (type === 'sleep') {
      setSchedule({
        ...schedule,
        sleep: {
          ...schedule.sleep,
          [field]: value,
        },
      });
    } else if (type === 'work' && schedule.work) {
      setSchedule({
        ...schedule,
        work: {
          ...schedule.work,
          [field]: value,
        },
      });
    }
  };

  const handleSave = () => {
    onSave(mySchedule, partnerSchedule);
    onClose();
  };

  // Calculate free time (when both are awake and not busy)
  const calculateFreeOverlap = (): { start: number; end: number }[] => {
    const myFree: boolean[] = Array(24).fill(false);
    const partnerFree: boolean[] = Array(24).fill(false);

    // Mark my free hours
    for (let h = 0; h < 24; h++) {
      const isAwake = !isInPeriod(h, mySchedule.sleep);
      const isNotWorking = !mySchedule.work || !isInPeriod(h, mySchedule.work);
      const isNotBusy = !mySchedule.busy.some(b => isInPeriod(h, b));
      myFree[h] = isAwake && isNotWorking && isNotBusy;
    }

    // Mark partner free hours
    for (let h = 0; h < 24; h++) {
      const isAwake = !isInPeriod(h, partnerSchedule.sleep);
      const isNotWorking = !partnerSchedule.work || !isInPeriod(h, partnerSchedule.work);
      const isNotBusy = !partnerSchedule.busy.some(b => isInPeriod(h, b));
      partnerFree[h] = isAwake && isNotWorking && isNotBusy;
    }

    // Find overlapping free periods
    const overlaps: { start: number; end: number }[] = [];
    let inOverlap = false;
    let overlapStart = 0;

    for (let h = 0; h < 24; h++) {
      if (myFree[h] && partnerFree[h]) {
        if (!inOverlap) {
          overlapStart = h;
          inOverlap = true;
        }
      } else {
        if (inOverlap) {
          overlaps.push({ start: overlapStart, end: h });
          inOverlap = false;
        }
      }
    }

    if (inOverlap) {
      overlaps.push({ start: overlapStart, end: 24 });
    }

    return overlaps;
  };

  const isInPeriod = (hour: number, period: { start: number; end: number }): boolean => {
    if (period.start <= period.end) {
      return hour >= period.start && hour < period.end;
    } else {
      // Wraps around midnight
      return hour >= period.start || hour < period.end;
    }
  };

  const freeOverlaps = calculateFreeOverlap();

  if (!visible) return null;

  // Helper component for editable time field
  const TimeEditField = ({
    person,
    type,
    field,
    value
  }: {
    person: 'my' | 'partner';
    type: 'sleep' | 'work';
    field: 'start' | 'end';
    value: number;
  }) => (
    <TouchableOpacity
      style={styles.timeEditField}
      onPress={() => {
        Alert.prompt(
          `Edit ${field === 'start' ? 'Start' : 'End'} Time`,
          `Enter hour (0-23) for ${type === 'sleep' ? 'sleep' : 'work'} ${field}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: (newValue) => {
                if (newValue) {
                  const hour = parseInt(newValue, 10);
                  if (!isNaN(hour) && hour >= 0 && hour < 24) {
                    handleTimeEdit(person, type, field, hour);
                  } else {
                    Alert.alert('Invalid Hour', 'Please enter a number between 0 and 23');
                  }
                }
              },
            },
          ],
          'plain-text',
          value.toString()
        );
      }}
    >
      <Text style={styles.timeEditText}>{formatHour(value)}</Text>
      <Edit2 size={12} color="rgba(255, 255, 255, 0.5)" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0118', '#1a1230', '#1e1b4b', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Rhythm</Text>
            <Text style={styles.subtitle}>Compare schedules and find the best time to connect</Text>
          </View>

          {/* Dual Schedule Cards */}
          <View style={styles.dualScheduleSection}>
            {/* My Schedule */}
            <View style={styles.scheduleColumn}>
              <View style={styles.scheduleHeader}>
                <View style={[styles.personDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.scheduleHeaderText}>{myName}</Text>
              </View>

              <BlurView intensity={60} tint="dark" style={styles.scheduleCard}>
                {/* Sleep */}
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleItemHeader}>
                    <Moon size={14} color="#a78bfa" />
                    <Text style={styles.scheduleLabel}>Sleep</Text>
                  </View>
                  <View style={styles.timeRange}>
                    <TimeEditField person="my" type="sleep" field="start" value={mySchedule.sleep.start} />
                    <Text style={styles.timeSeparator}>—</Text>
                    <TimeEditField person="my" type="sleep" field="end" value={mySchedule.sleep.end} />
                  </View>
                </View>

                {/* Work */}
                {mySchedule.work && (
                  <View style={styles.scheduleItem}>
                    <View style={styles.scheduleItemHeader}>
                      <Briefcase size={14} color="#60a5fa" />
                      <Text style={styles.scheduleLabel}>Work</Text>
                    </View>
                    <View style={styles.timeRange}>
                      <TimeEditField person="my" type="work" field="start" value={mySchedule.work.start} />
                      <Text style={styles.timeSeparator}>—</Text>
                      <TimeEditField person="my" type="work" field="end" value={mySchedule.work.end} />
                    </View>
                  </View>
                )}
              </BlurView>

              {/* Quick Templates */}
              <Text style={styles.templatesSectionTitle}>Quick Templates</Text>
              <View style={styles.templatesGrid}>
                {TEMPLATES.slice(0, 3).map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateChip}
                    onPress={() => handleTemplateSelect('my', template)}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.templateChipBlur}>
                      {template.icon}
                      <Text style={styles.templateChipText}>{template.name}</Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Partner Schedule */}
            <View style={styles.scheduleColumn}>
              <View style={styles.scheduleHeader}>
                <View style={[styles.personDot, { backgroundColor: '#ec4899' }]} />
                <Text style={styles.scheduleHeaderText}>{partnerName}</Text>
              </View>

              <BlurView intensity={60} tint="dark" style={styles.scheduleCard}>
                {/* Sleep */}
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleItemHeader}>
                    <Moon size={14} color="#a78bfa" />
                    <Text style={styles.scheduleLabel}>Sleep</Text>
                  </View>
                  <View style={styles.timeRange}>
                    <TimeEditField person="partner" type="sleep" field="start" value={partnerSchedule.sleep.start} />
                    <Text style={styles.timeSeparator}>—</Text>
                    <TimeEditField person="partner" type="sleep" field="end" value={partnerSchedule.sleep.end} />
                  </View>
                </View>

                {/* Work */}
                {partnerSchedule.work && (
                  <View style={styles.scheduleItem}>
                    <View style={styles.scheduleItemHeader}>
                      <Briefcase size={14} color="#60a5fa" />
                      <Text style={styles.scheduleLabel}>Work</Text>
                    </View>
                    <View style={styles.timeRange}>
                      <TimeEditField person="partner" type="work" field="start" value={partnerSchedule.work.start} />
                      <Text style={styles.timeSeparator}>—</Text>
                      <TimeEditField person="partner" type="work" field="end" value={partnerSchedule.work.end} />
                    </View>
                  </View>
                )}
              </BlurView>

              {/* Quick Templates */}
              <Text style={styles.templatesSectionTitle}>Quick Templates</Text>
              <View style={styles.templatesGrid}>
                {TEMPLATES.slice(0, 3).map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateChip}
                    onPress={() => handleTemplateSelect('partner', template)}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.templateChipBlur}>
                      {template.icon}
                      <Text style={styles.templateChipText}>{template.name}</Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* 24-Hour Horizontal Timeline Visualization */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>24-Hour Activity Comparison</Text>
            <Text style={styles.timelineSubtitle}>
              Green areas show when both of you are free to connect
            </Text>

            {/* Combined Timeline with Overlap Highlighting */}
            <View style={styles.combinedTimeline}>
              {/* My Timeline */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineLabel}>
                  <View style={[styles.personDot, { backgroundColor: '#06b6d4' }]} />
                  <Text style={styles.timelineLabelText}>{myName}</Text>
                </View>
                <View style={styles.timelineBar}>
                  {renderTimelineBar(mySchedule, '#06b6d4')}
                </View>
              </View>

              {/* Partner Timeline */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineLabel}>
                  <View style={[styles.personDot, { backgroundColor: '#ec4899' }]} />
                  <Text style={styles.timelineLabelText}>{partnerName}</Text>
                </View>
                <View style={styles.timelineBar}>
                  {renderTimelineBar(partnerSchedule, '#ec4899')}
                </View>
              </View>

              {/* Overlap Highlighting Row */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineLabel}>
                  <View style={[styles.personDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.timelineLabelText}>Free</Text>
                </View>
                <View style={styles.timelineBar}>
                  {freeOverlaps.map((overlap, index) => {
                    const left = (overlap.start / 24) * 100;
                    const width = ((overlap.end - overlap.start) / 24) * 100;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.timelineSegment,
                          {
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: 'rgba(16, 185, 129, 0.6)',
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Hour Labels */}
              <View style={styles.hourLabels}>
                {[0, 6, 12, 18, 24].map(h => (
                  <Text key={h} style={styles.hourLabel}>{h}:00</Text>
                ))}
              </View>
            </View>
          </View>

          {/* Best Time to Connect */}
          {freeOverlaps.length > 0 ? (
            <View style={styles.bestTimeSection}>
              <Text style={styles.sectionTitle}>💚 Best Times for Video Calls & Chatting</Text>
              <BlurView intensity={60} tint="dark" style={styles.bestTimeCard}>
                {freeOverlaps.map((overlap, index) => {
                  const duration = overlap.end - overlap.start;
                  return (
                    <View key={index} style={styles.bestTimeItem}>
                      <View style={styles.bestTimeDot} />
                      <Text style={styles.bestTimeText}>
                        {formatHour(overlap.start)} - {formatHour(overlap.end)}
                      </Text>
                      <Text style={styles.bestTimeDuration}>
                        {duration}h free
                      </Text>
                    </View>
                  );
                })}
              </BlurView>
            </View>
          ) : (
            <View style={styles.noOverlapSection}>
              <BlurView intensity={40} tint="dark" style={styles.noOverlapCard}>
                <Clock size={24} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.noOverlapText}>
                  No overlapping free time found. Adjust schedules to find time together.
                </Text>
              </BlurView>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Schedule</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <BlurView intensity={30} tint="dark" style={styles.closeButtonBlur}>
            <X size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// Helper function to render timeline bar
function renderTimelineBar(schedule: DailySchedule, color: string) {
  const bars: React.ReactNode[] = [];

  // Sleep period (purple)
  const sleepStart = (schedule.sleep.start / 24) * 100;
  const sleepWidth = schedule.sleep.start <= schedule.sleep.end
    ? ((schedule.sleep.end - schedule.sleep.start) / 24) * 100
    : ((24 - schedule.sleep.start + schedule.sleep.end) / 24) * 100;

  bars.push(
    <View
      key="sleep"
      style={[
        styles.timelineSegment,
        {
          left: `${sleepStart}%`,
          width: `${sleepWidth}%`,
          backgroundColor: 'rgba(167, 139, 250, 0.5)',
        },
      ]}
    />
  );

  // Work period (blue)
  if (schedule.work) {
    const workStart = (schedule.work.start / 24) * 100;
    const workWidth = ((schedule.work.end - schedule.work.start) / 24) * 100;
    bars.push(
      <View
        key="work"
        style={[
          styles.timelineSegment,
          {
            left: `${workStart}%`,
            width: `${workWidth}%`,
            backgroundColor: 'rgba(96, 165, 250, 0.5)',
          },
        ]}
      />
    );
  }

  return bars;
}

function formatHour(hour: number): string {
  const h = hour % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  // Dual Schedule Section
  dualScheduleSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  scheduleColumn: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scheduleHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  personDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 16,
  },
  scheduleItem: {
    gap: 8,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeEditField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timeEditText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  // Templates
  templatesSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  templatesGrid: {
    gap: 6,
  },
  templateChip: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  templateChipBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Timeline Section
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  timelineSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
  },
  combinedTimeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  timelineLabelText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  timelineBar: {
    flex: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  timelineSegment: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  hourLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 70,
    marginTop: 8,
  },
  hourLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Best Time Section
  bestTimeSection: {
    marginBottom: 24,
  },
  bestTimeCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  bestTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bestTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  bestTimeText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  bestTimeDuration: {
    fontSize: 12,
    color: 'rgba(16, 185, 129, 0.9)',
    fontWeight: '600',
  },
  // No Overlap Section
  noOverlapSection: {
    marginBottom: 24,
  },
  noOverlapCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noOverlapText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Save Button
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Close Button
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
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
});
