import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { WeatherData, LocationData } from '@aura/shared';
import { X, Sun, Moon, Clock, MapPin, Plane } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path } from 'react-native-svg';

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

interface TimeMapping {
  myHour: number;
  partnerHour: number;
  myMinute: number;
  partnerMinute: number;
  isMyDay: boolean;
  isPartnerDay: boolean;
  isCurrent: boolean;
}

/**
 * TimeBridge - Enhanced timezone comparison with visual elements
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values for clocks
  const myClockRotation = useRef(new RNAnimated.Value(0)).current;
  const partnerClockRotation = useRef(new RNAnimated.Value(0)).current;
  const planeOffset = useRef(new RNAnimated.Value(0)).current;

  // Update current time every minute
  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [visible]);

  // Animate clocks and plane when visible
  useEffect(() => {
    if (visible) {
      // Clock rotation animation
      RNAnimated.loop(
        RNAnimated.timing(myClockRotation, {
          toValue: 360,
          duration: 60000, // One full rotation per minute
          useNativeDriver: true,
        })
      ).start();

      RNAnimated.loop(
        RNAnimated.timing(partnerClockRotation, {
          toValue: 360,
          duration: 60000,
          useNativeDriver: true,
        })
      ).start();

      // Plane flying animation
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(planeOffset, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          RNAnimated.timing(planeOffset, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  // Scroll to current time when opening
  useEffect(() => {
    if (visible && myWeather && scrollViewRef.current) {
      const myTimeParts = new Intl.DateTimeFormat('en-US', {
        timeZone: myWeather.timezone,
        hour: 'numeric',
        hour12: false,
      }).formatToParts(currentTime);

      const currentHour = parseInt(
        myTimeParts.find((part) => part.type === 'hour')?.value || '0'
      );

      // Scroll to current time (each row is about 60px)
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentHour * 60 - 150),
          animated: true,
        });
      }, 500);
    }
  }, [visible]);

  // Generate 24-hour time comparison table
  const timeTable = useMemo((): TimeMapping[] => {
    if (!myWeather || !partnerWeather) return [];

    const table: TimeMapping[] = [];

    const myTimeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: myWeather.timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(currentTime);

    const myCurrentHour = parseInt(
      myTimeParts.find((part) => part.type === 'hour')?.value || '0'
    );
    const myCurrentMinute = parseInt(
      myTimeParts.find((part) => part.type === 'minute')?.value || '0'
    );

    const mySunrise = new Date(myWeather.daily.sunrise[0]);
    const mySunset = new Date(myWeather.daily.sunset[0]);
    const partnerSunrise = new Date(partnerWeather.daily.sunrise[0]);
    const partnerSunset = new Date(partnerWeather.daily.sunset[0]);

    const mySunriseHour = mySunrise.getUTCHours();
    const mySunsetHour = mySunset.getUTCHours();
    const partnerSunriseHour = partnerSunrise.getUTCHours();
    const partnerSunsetHour = partnerSunset.getUTCHours();

    for (let i = 0; i < 24; i++) {
      const myHour = i;
      const partnerHour = (i + (timeDifference || 0) + 24) % 24;

      const isMyDay = myHour >= mySunriseHour && myHour < mySunsetHour;
      const isPartnerDay = partnerHour >= partnerSunriseHour && partnerHour < partnerSunsetHour;
      const isCurrent = myHour === myCurrentHour;

      table.push({
        myHour,
        partnerHour,
        myMinute: isCurrent ? myCurrentMinute : 0,
        partnerMinute: isCurrent ? myCurrentMinute : 0,
        isMyDay,
        isPartnerDay,
        isCurrent,
      });
    }

    return table;
  }, [myWeather, partnerWeather, timeDifference, currentTime]);

  const formatTime = (hour: number, minute: number, showMinute: boolean = false) => {
    if (showMinute) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Render distance visualization with animated plane
  const renderDistanceVisualization = () => {
    if (!distance) return null;

    const [containerWidth, setContainerWidth] = useState(0);

    const planeTranslateX = planeOffset.interpolate({
      inputRange: [0, 1],
      // Ensure containerWidth is not 0 to avoid division by zero or NaN
      outputRange: [0, containerWidth > 0 ? containerWidth - 24 : 0],
    });

    return (
      <View style={styles.distanceCard}>
        <View style={styles.distanceHeader}>
          <MapPin size={18} color="#06b6d4" />
          <Text style={styles.distanceTitle}>Distance Between Locations</Text>
        </View>

        {/* Visual distance representation */}
        <View style={styles.distanceVisual}>
          {/* Starting point */}
          <View style={styles.locationDot}>
            <View style={[styles.locationPin, { backgroundColor: '#06b6d4' }]} />
            <Text style={styles.locationLabel}>You</Text>
          </View>

          {/* This container will measure itself and hold the line/plane */}
          <View 
            style={styles.connectionAndPlaneContainer}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
          >
            {containerWidth > 0 && (
              <>
                <Svg height="100%" width="100%">
                  <Line
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </Svg>
                <RNAnimated.View
                  style={[
                    styles.animatedPlane,
                    { transform: [{ translateX: planeTranslateX }] },
                  ]}
                >
                  <Plane size={24} color="#06b6d4" />
                </RNAnimated.View>
              </>
            )}
          </View>

          {/* Ending point */}
          <View style={styles.locationDot}>
            <View style={[styles.locationPin, { backgroundColor: '#ec4899' }]} />
            <Text style={styles.locationLabel}>Partner</Text>
          </View>
        </View>

        {/* Distance info */}
        <View style={styles.distanceInfo}>
          <Text style={styles.distanceValue}>{Math.round(distance).toLocaleString()} km</Text>
          <Text style={styles.distanceSubtext}>
            ≈ {Math.round(distance * 0.621371).toLocaleString()} miles
          </Text>
          <Text style={styles.distanceSubtext}>
            Flight time: ≈ {Math.round(distance / 800)} hours
          </Text>
        </View>
      </View>
    );
  };

  // Render time difference with dual clocks
  const renderTimeDifferenceVisualization = () => {
    if (timeDifference === null || !myWeather?.timezone || !partnerWeather?.timezone) return null;

    // A new, functional Analog Clock component
    const AnalogClock = ({ timeZone }: { timeZone: string }) => {
      const [time, setTime] = useState(new Date());

      useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
      }, []);

      const timeParts = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        });
        const parts = formatter.formatToParts(time);
        const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
        return {
          hours: get('hour'),
          minutes: get('minute'),
          seconds: get('second'),
        };
      }, [time, timeZone]);

      const { hours, minutes, seconds } = timeParts;
      const secondDeg = seconds * 6;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      const hourDeg = (hours % 12) * 30 + minutes * 0.5;

      return (
        <View style={styles.clock}>
          <Svg height="80" width="80" viewBox="0 0 80 80">
            <Circle cx="40" cy="40" r="38" stroke="#334155" strokeWidth="2" fill="rgba(15, 23, 42, 0.8)" />
            
            {/* Hour Hand */}
            <Line
              x1="40"
              y1="40"
              x2="40"
              y2="20"
              stroke="#94a3b8"
              strokeWidth="3"
              strokeLinecap="round"
              rotation={hourDeg}
              origin="40, 40"
            />
            
            {/* Minute Hand */}
            <Line
              x1="40"
              y1="40"
              x2="40"
              y2="12"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinecap="round"
              rotation={minuteDeg}
              origin="40, 40"
            />

            {/* Second Hand */}
            <Line
              x1="40"
              y1="40"
              x2="40"
              y2="8"
              stroke="#ec4899"
              strokeWidth="1"
              strokeLinecap="round"
              rotation={secondDeg}
              origin="40, 40"
            />

            <Circle cx="40" cy="40" r="3" fill="#ec4899" />
          </Svg>
        </View>
      );
    };

    return (
      <View style={styles.timeDiffCard}>
        <View style={styles.timeDiffHeader}>
          <Clock size={18} color="#fbbf24" />
          <Text style={styles.timeDiffTitle}>Time Difference</Text>
        </View>

        <View style={styles.clocksContainer}>
          {/* My Clock */}
          <View style={styles.clockWrapper}>
            <Text style={styles.clockLabel}>
              {myLocation?.nickname || myLocation?.name || 'You'}
            </Text>
            <AnalogClock timeZone={myWeather.timezone} />
            <Text style={styles.clockTime}>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: myWeather?.timezone,
              })}
            </Text>
          </View>

          {/* Time Difference Display */}
          <View style={styles.diffIndicator}>
            <Text style={styles.diffValue}>
              {timeDifference >= 0 ? '+' : ''}
              {timeDifference}
            </Text>
            <Text style={styles.diffLabel}>hours</Text>
          </View>

          {/* Partner Clock */}
          <View style={styles.clockWrapper}>
            <Text style={styles.clockLabel}>
              {partnerLocation?.nickname || partnerLocation?.name || 'Partner'}
            </Text>
            <AnalogClock timeZone={partnerWeather.timezone} />
            <Text style={styles.clockTime}>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: partnerWeather?.timezone,
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.98)', 'rgba(30, 41, 59, 0.98)']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Time Bridge</Text>
              <Text style={styles.headerSubtitle}>Complete Timezone Comparison</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* Distance Visualization */}
            {renderDistanceVisualization()}

            {/* Time Difference Visualization */}
            {renderTimeDifferenceVisualization()}

            {/* 24-Hour Comparison Table */}
            <View style={styles.tableSection}>
              <Text style={styles.sectionTitle}>24-Hour Time Comparison</Text>
              <Text style={styles.sectionSubtitle}>Scroll to see all hours</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>
                    {myLocation?.nickname || myLocation?.name || 'You'}
                  </Text>
                </View>
                <View style={styles.tableHeaderDivider} />
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>
                    {partnerLocation?.nickname || partnerLocation?.name || 'Partner'}
                  </Text>
                </View>
              </View>

              {/* Scrollable Time Table */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.timeTableScroll}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {timeTable.map((mapping, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      mapping.isCurrent && styles.tableRowCurrent,
                    ]}
                  >
                    {/* My Time */}
                    <View style={styles.timeCell}>
                      <View style={styles.timeCellContent}>
                        {mapping.isMyDay ? (
                          <Sun size={16} color="#fbbf24" />
                        ) : (
                          <Moon size={16} color="#93c5fd" />
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            mapping.isCurrent && styles.timeTextCurrent,
                          ]}
                        >
                          {formatTime(mapping.myHour, mapping.myMinute, mapping.isCurrent)}
                        </Text>
                      </View>
                      {mapping.isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>NOW</Text>
                        </View>
                      )}
                    </View>

                    {/* Connection Line */}
                    <View style={styles.connectionCell}>
                      <View style={styles.connectionDot} />
                      <View style={styles.connectionLineHorizontal} />
                      <View style={styles.connectionDot} />
                    </View>

                    {/* Partner Time */}
                    <View style={[styles.timeCell, { justifyContent: 'flex-end' }]}>
                      <View style={styles.timeCellContent}>
                        {mapping.isPartnerDay ? (
                          <Sun size={16} color="#fbbf24" />
                        ) : (
                          <Moon size={16} color="#93c5fd" />
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            mapping.isCurrent && styles.timeTextCurrent,
                          ]}
                        >
                          {formatTime(
                            mapping.partnerHour,
                            mapping.partnerMinute,
                            mapping.isCurrent
                          )}
                        </Text>
                      </View>
                      {mapping.isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>NOW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <Sun size={14} color="#fbbf24" />
                  <Text style={styles.legendText}>Day</Text>
                </View>
                <View style={styles.legendItem}>
                  <Moon size={14} color="#93c5fd" />
                  <Text style={styles.legendText}>Night</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>NOW</Text>
                  </View>
                  <Text style={styles.legendText}>Current time</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '95%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  mainScroll: {
    flex: 1,
  },

  // Distance Card
  distanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06b6d4',
  },
  distanceVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 50, // Give a fixed height for vertical alignment
  },
  locationDot: {
    alignItems: 'center',
    gap: 4,
    width: 60, // Increased width to prevent text wrapping
  },
  locationPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  connectionAndPlaneContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  animatedPlane: {
    position: 'absolute',
    top: '50%',
    marginTop: -12, // Half of plane size (24)
  },
  distanceInfo: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  distanceSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },

  // Time Difference Card
  timeDiffCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  timeDiffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeDiffTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
  },
  clocksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  clockWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  clockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  clock: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  diffIndicator: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  diffValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  diffLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },

  // Table Section
  tableSection: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderDivider: {
    width: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  timeTableScroll: {
    maxHeight: 300,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    paddingVertical: 10,
  },
  tableRowCurrent: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  timeCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  timeCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  timeTextCurrent: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  connectionCell: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748b',
  },
  connectionLineHorizontal: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  currentBadge: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});

export default TimeBridge;
