import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Heart, Calendar, Clock } from 'lucide-react-native';

interface RelationshipMilestoneProps {
  relationshipStart?: string; // ISO date string
  nextMeetingDate?: string;   // ISO date string
  lastMetDate?: string;        // ISO date string
  onEdit?: () => void;         // Callback to edit dates
}

/**
 * RelationshipMilestone - Displays relationship timeline information
 * Shows days together, next meeting countdown, and last meeting info
 */
const RelationshipMilestone: React.FC<RelationshipMilestoneProps> = ({
  relationshipStart,
  nextMeetingDate,
  lastMetDate,
  onEdit,
}) => {
  // Calculate days together
  const daysTogether = useMemo(() => {
    if (!relationshipStart) return null;
    const start = new Date(relationshipStart);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [relationshipStart]);

  // Calculate days until next meeting
  const daysUntilMeeting = useMemo(() => {
    if (!nextMeetingDate) return null;
    const meeting = new Date(nextMeetingDate);
    const now = new Date();
    const diff = meeting.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null; // Don't show if date has passed
  }, [nextMeetingDate]);

  // Calculate days since last meeting
  const daysSinceLastMeeting = useMemo(() => {
    if (!lastMetDate) return null;
    const lastMet = new Date(lastMetDate);
    const now = new Date();
    const diff = now.getTime() - lastMet.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [lastMetDate]);

  // Don't render if no data
  if (!daysTogether && !daysUntilMeeting && !daysSinceLastMeeting) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(800).delay(400)}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onEdit}
        activeOpacity={onEdit ? 0.7 : 1}
        disabled={!onEdit}
      >
        <View style={styles.content}>
          {/* Days Together */}
          {daysTogether !== null && (
            <View style={styles.milestone}>
              <View style={styles.iconContainer}>
                <Heart size={20} color="#f472b6" fill="#f472b6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.value}>{daysTogether.toLocaleString()}</Text>
                <Text style={styles.label}>days together</Text>
              </View>
            </View>
          )}

          {/* Next Meeting Countdown */}
          {daysUntilMeeting !== null && (
            <View style={styles.milestone}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color="#06b6d4" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.value}>{daysUntilMeeting}</Text>
                <Text style={styles.label}>
                  {daysUntilMeeting === 1 ? 'day until we meet' : 'days until we meet'}
                </Text>
              </View>
            </View>
          )}

          {/* Days Since Last Meeting */}
          {daysSinceLastMeeting !== null && !daysUntilMeeting && (
            <View style={styles.milestone}>
              <View style={styles.iconContainer}>
                <Clock size={20} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.value}>{daysSinceLastMeeting}</Text>
                <Text style={styles.label}>
                  {daysSinceLastMeeting === 1 ? 'day since we met' : 'days since we met'}
                </Text>
              </View>
            </View>
          )}

          {/* Edit hint */}
          {onEdit && (
            <Text style={styles.editHint}>Tap to edit dates</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: [{ translateY: -60 }],
    zIndex: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    // Backdrop blur effect would be ideal here but requires expo-blur
  },
  content: {
    padding: 20,
    gap: 16,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  editHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default RelationshipMilestone;
