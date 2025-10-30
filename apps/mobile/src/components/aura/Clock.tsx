import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{hours}</Text>
      <Text style={styles.separator}>:</Text>
      <Text style={styles.timeText}>{minutes}</Text>
      <Text style={styles.separator}>:</Text>
      <Text style={styles.timeText}>{seconds}</Text>
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
