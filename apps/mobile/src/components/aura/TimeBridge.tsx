import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { WeatherData, LocationData } from '@aura/shared';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimeBridgeProps {
  visible: boolean;
  onClose: () => void;
  myLocation: LocationData | null;
  partnerLocation: LocationData | null;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  distance: number | null;
  timeDifference: number | null;
}

/**
 * TimeBridge - Modal showing detailed timeline comparison
 * Simplified version of web's MapPeek component
 */
const TimeBridge: React.FC<TimeBridgeProps> = ({
  visible,
  onClose,
  myLocation,
  partnerLocation,
  myWeather,
  partnerWeather,
  distance,
  timeDifference,
}) => {
  const renderTimeline = (
    weather: WeatherData | null,
    location: LocationData | null,
    label: string
  ) => {
    if (!weather || !location) return null;

    const sunrise = new Date(weather.daily.sunrise[0]);
    const sunset = new Date(weather.daily.sunset[0]);

    // Calculate percentages for timeline
    const sunrisePercent = (sunrise.getHours() * 60 + sunrise.getMinutes()) / (24 * 60);
    const sunsetPercent = (sunset.getHours() * 60 + sunset.getMinutes()) / (24 * 60);
    const dayPercent = (sunsetPercent - sunrisePercent) * 100;
    const nightBeforePercent = sunrisePercent * 100;

    return (
      <View style={styles.timelineSection}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.locationName}>{location.name}</Text>

        {/* Timeline bar */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineBar}>
            {/* Night before sunrise */}
            <View
              style={[
                styles.nightSegment,
                {
                  left: 0,
                  width: `${nightBeforePercent}%`,
                },
              ]}
            />
            {/* Night after sunset */}
            <View
              style={[
                styles.nightSegment,
                {
                  left: `${sunsetPercent * 100}%`,
                  width: `${(1 - sunsetPercent) * 100}%`,
                },
              ]}
            />

            {/* Sunrise marker */}
            <View
              style={[
                styles.timelineMarker,
                styles.sunriseMarker,
                { left: `${sunrisePercent * 100}%` },
              ]}
            >
              <Text style={styles.markerLabel}>↑</Text>
            </View>

            {/* Sunset marker */}
            <View
              style={[
                styles.timelineMarker,
                styles.sunsetMarker,
                { left: `${sunsetPercent * 100}%` },
              ]}
            >
              <Text style={styles.markerLabel}>↓</Text>
            </View>
          </View>
        </View>

        {/* Time labels */}
        <View style={styles.timeLabels}>
          <Text style={styles.timeLabel}>00:00</Text>
          <Text style={styles.timeLabel}>06:00</Text>
          <Text style={styles.timeLabel}>12:00</Text>
          <Text style={styles.timeLabel}>18:00</Text>
          <Text style={styles.timeLabel}>24:00</Text>
        </View>

        {/* Sunrise/Sunset times */}
        <View style={styles.sunTimes}>
          <Text style={styles.sunTimeText}>
            Sunrise:{' '}
            {sunrise.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: weather.timezone,
            })}
          </Text>
          <Text style={styles.sunTimeText}>
            Sunset:{' '}
            {sunset.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: weather.timezone,
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Time Bridge</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          {(distance !== null || timeDifference !== null) && (
            <View style={styles.stats}>
              {distance !== null && (
                <Text style={styles.statText}>
                  Distance: {Math.round(distance).toLocaleString()} km
                </Text>
              )}
              {timeDifference !== null && (
                <Text style={styles.statText}>
                  Time difference: {timeDifference >= 0 ? '+' : ''}
                  {timeDifference}h
                </Text>
              )}
            </View>
          )}

          {/* Timelines */}
          <ScrollView style={styles.scrollView}>
            {renderTimeline(partnerWeather, partnerLocation, 'Partner')}
            {renderTimeline(myWeather, myLocation, 'You')}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  stats: {
    marginBottom: 24,
    gap: 8,
  },
  statText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  timelineSection: {
    marginBottom: 32,
  },
  timelineLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  timelineContainer: {
    height: 40,
    marginBottom: 8,
  },
  timelineBar: {
    width: '100%',
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'visible',
  },
  nightSegment: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  timelineMarker: {
    position: 'absolute',
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  sunriseMarker: {
    backgroundColor: '#fbbf24', // amber-400
  },
  sunsetMarker: {
    backgroundColor: '#f97316', // orange-500
  },
  markerLabel: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sunTimes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  sunTimeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default TimeBridge;
