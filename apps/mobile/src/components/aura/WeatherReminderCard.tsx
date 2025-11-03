import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { WeatherReminder } from '../../utils/weatherReminders';

interface WeatherReminderCardProps {
  reminders: WeatherReminder[];
  onDismiss?: () => void;
}

/**
 * WeatherReminderCard - Minimalist weather care notification
 * Shows a single, concise weather reminder with elegant design
 */
const WeatherReminderCard: React.FC<WeatherReminderCardProps> = ({
  reminders,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (reminders.length === 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Show only the most important reminder
  const reminder = reminders.find((r) => r.severity === 'alert') || reminders[0];

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(1000)}
      exiting={FadeOutDown.duration(300)}
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={styles.touchable}
      >
        <BlurView intensity={40} tint="dark" style={styles.blur}>
          <View style={styles.content}>
            <Text style={styles.icon}>{reminder.icon}</Text>
            <Text style={styles.message}>{reminder.message}</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});

export default WeatherReminderCard;
