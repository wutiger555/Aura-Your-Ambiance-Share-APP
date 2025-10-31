import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface ClockProps {
  timeZone?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

export default function Clock({ timeZone, style, containerStyle }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time with timezone if provided
  const getFormattedTime = () => {
    if (timeZone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        return formatter.format(time);
      } catch (error) {
        console.error('Invalid timezone:', timeZone);
      }
    }

    // Fallback to local time
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formattedTime = getFormattedTime();
  const [hours, minutes, seconds] = formattedTime.split(':');

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.timeText, style]}>{hours}</Text>
      <Text style={[styles.separator, style]}>:</Text>
      <Text style={[styles.timeText, style]}>{minutes}</Text>
      <Text style={[styles.separator, style]}>:</Text>
      <Text style={[styles.timeText, style]}>{seconds}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '100',
    color: 'white',
  },
  separator: {
    fontSize: 72,
    fontWeight: '100',
    color: 'white',
    opacity: 0.5,
    marginHorizontal: 4,
  },
});
