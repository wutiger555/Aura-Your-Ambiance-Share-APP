import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, X, Clock, MapPin } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface AlarmCountdownPopupProps {
  visible: boolean;
  onClose: () => void;
  nextAlarm: {
    label: string;
    time: Date;
    timeString: string;
    timeZoneReference?: 'my' | 'partner';
  } | null;
  timeRemaining: string;
}

/**
 * AlarmCountdownPopup - Expandable popup showing full alarm details
 * v2.7.0: Clean modal overlay with alarm countdown information
 *
 * Design principles:
 * - Glass-morphism card centered on screen
 * - Shows label, time, countdown, timezone reference
 * - Tap outside or X button to close
 */
const AlarmCountdownPopup: React.FC<AlarmCountdownPopupProps> = ({
  visible,
  onClose,
  nextAlarm,
  timeRemaining,
}) => {
  if (!nextAlarm) return null;

  const getReferenceLabel = () => {
    if (!nextAlarm.timeZoneReference) return '';
    return nextAlarm.timeZoneReference === 'my' ? 'Your time' : "Partner's time";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.backdrop}
          />

          <TouchableWithoutFeedback>
            <Animated.View
              entering={SlideInUp.duration(300).springify()}
              exiting={SlideOutUp.duration(200)}
              style={styles.popupContainer}
            >
              <AnimatedBlurView intensity={80} tint="dark" style={styles.popup}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={20} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <Bell size={28} color="#06b6d4" strokeWidth={2} />
                  </View>
                  <Text style={styles.title}>Next Alarm</Text>
                </View>

                {/* Alarm label */}
                <Text style={styles.alarmLabel}>{nextAlarm.label}</Text>

                {/* Countdown */}
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownLabel}>in</Text>
                  <Text style={styles.countdownValue}>{timeRemaining}</Text>
                </View>

                {/* Time info */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.infoText}>{nextAlarm.timeString}</Text>
                  </View>

                  {getReferenceLabel() && (
                    <View style={styles.infoRow}>
                      <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
                      <Text style={styles.infoText}>{getReferenceLabel()}</Text>
                    </View>
                  )}
                </View>
              </AnimatedBlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  popupContainer: {
    width: '100%',
    maxWidth: 320,
  },
  popup: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 28,
    // Glow effect
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  alarmLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 16,
  },
  countdownLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  countdownValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: -0.5,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default AlarmCountdownPopup;
