import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { X, Edit3, MapPin, Plane } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import { LocationData, WeatherData } from '@aura/shared';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

type EditingLocation = 'my' | 'partner' | null;

/**
 * Settings - Connection Management Interface
 * Design Philosophy:
 * - World map showing actual geographic connection
 * - Flight path with distance and duration
 * - Inline editing for location nicknames
 * - Ritualistic "break connection" for reset
 */
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
  const [editing, setEditing] = useState<EditingLocation>(null);
  const [myNickname, setMyNickname] = useState(myLocation?.nickname || '');
  const [partnerNickname, setPartnerNickname] = useState(partnerLocation?.nickname || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);

  // Plane animation
  const planePosition = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // Animate plane
      planePosition.value = withRepeat(
        withTiming(1, {
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      );
    }
  }, [visible]);

  // Convert lat/long to screen coordinates (simplified for better visibility)
  const latLongToMapCoords = (lat: number, long: number) => {
    const mapWidth = SCREEN_WIDTH * 0.8;
    const mapHeight = 200;
    const centerX = SCREEN_WIDTH * 0.5;
    const centerY = 230; // Fixed position

    // Simplified projection
    const x = centerX + ((long / 180) * (mapWidth / 2));
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = centerY - (mercN / Math.PI) * (mapHeight / 2);

    return { x, y };
  };

  const myMapPos = myLocation
    ? latLongToMapCoords(myLocation.latitude, myLocation.longitude)
    : { x: SCREEN_WIDTH * 0.25, y: 230 };

  const partnerMapPos = partnerLocation
    ? latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude)
    : { x: SCREEN_WIDTH * 0.75, y: 230 };

  // Calculate distance and flight time
  const calculateDistance = () => {
    if (!myLocation || !partnerLocation) return 0;
    const R = 6371; // Earth's radius in km
    const lat1 = (myLocation.latitude * Math.PI) / 180;
    const lat2 = (partnerLocation.latitude * Math.PI) / 180;
    const deltaLat = ((partnerLocation.latitude - myLocation.latitude) * Math.PI) / 180;
    const deltaLon = ((partnerLocation.longitude - myLocation.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const distance = calculateDistance();
  const flightHours = Math.floor(distance / 800); // Average flight speed ~800 km/h
  const flightMinutes = Math.round((distance / 800 - flightHours) * 60);

  // Bezier curve for flight path
  const midX = (myMapPos.x + partnerMapPos.x) / 2;
  const midY = Math.min(myMapPos.y, partnerMapPos.y) - 80; // Arc upwards
  const flightPath = `M ${myMapPos.x} ${myMapPos.y} Q ${midX} ${midY} ${partnerMapPos.x} ${partnerMapPos.y}`;

  const handleSave = (location: 'my' | 'partner') => {
    if (onUpdateNicknames) {
      onUpdateNicknames(
        location === 'my' ? myNickname.trim() : myLocation?.nickname || '',
        location === 'partner' ? partnerNickname.trim() : partnerLocation?.nickname || ''
      );
    }
    setEditing(null);
  };

  const handleResetHold = () => {
    // Hold to break connection
    const interval = setInterval(() => {
      setResetProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowResetConfirm(false);
          onReset();
          onClose();
          return 0;
        }
        return prev + 2;
      });
    }, 30);

    return () => {
      clearInterval(interval);
      setResetProgress(0);
    };
  };

  const planeAnimatedStyle = useAnimatedStyle(() => {
    const t = planePosition.value;
    const x = (1 - t) * (1 - t) * myMapPos.x + 2 * (1 - t) * t * midX + t * t * partnerMapPos.x;
    const y = (1 - t) * (1 - t) * myMapPos.y + 2 * (1 - t) * t * midY + t * t * partnerMapPos.y;

    // Calculate rotation angle
    const dx = partnerMapPos.x - myMapPos.x;
    const dy = partnerMapPos.y - myMapPos.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      transform: [
        { translateX: x - 12 },
        { translateY: y - 12 },
        { rotate: `${angle + 90}deg` },
      ],
    };
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#0a0118', '#1a1230', '#1e1b4b', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Connection</Text>
          <Text style={styles.subtitle}>Tap location names to edit</Text>
        </View>

        {/* Map Background - Stylized world map pattern */}
        <View style={styles.mapBackground}>
          {/* Grid lines to simulate map */}
          <View style={styles.mapGrid}>
            {[...Array(6)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 16.66}%` }]} />
            ))}
            {[...Array(8)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 12.5}%` }]} />
            ))}
          </View>

          {/* Flight Path SVG */}
          <Svg width={SCREEN_WIDTH} height={350} style={styles.flightSvg}>
            <Defs>
              <SvgLinearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </SvgLinearGradient>
            </Defs>

            {/* Flight path */}
            <Path
              d={flightPath}
              stroke="url(#flightGradient)"
              strokeWidth={3}
              fill="none"
              strokeDasharray="8,6"
            />

            {/* My location marker */}
            <G>
              <Circle cx={myMapPos.x} cy={myMapPos.y} r={20} fill="rgba(6, 182, 212, 0.15)" />
              <Circle cx={myMapPos.x} cy={myMapPos.y} r={12} fill="#06b6d4" />
              <Circle cx={myMapPos.x} cy={myMapPos.y} r={5} fill="white" />
            </G>

            {/* Partner location marker */}
            <G>
              <Circle cx={partnerMapPos.x} cy={partnerMapPos.y} r={20} fill="rgba(236, 72, 153, 0.15)" />
              <Circle cx={partnerMapPos.x} cy={partnerMapPos.y} r={12} fill="#ec4899" />
              <Circle cx={partnerMapPos.x} cy={partnerMapPos.y} r={5} fill="white" />
            </G>
          </Svg>

          {/* Animated plane */}
          <Animated.View style={[styles.plane, planeAnimatedStyle]}>
            <Plane size={20} color="#ffffff" strokeWidth={2} />
          </Animated.View>

          {/* City labels */}
          <View style={[styles.cityLabel, { left: myMapPos.x - 50, top: myMapPos.y + 30 }]}>
            <Text style={styles.cityLabelText}>{myLocation?.name}</Text>
          </View>
          <View style={[styles.cityLabel, { left: partnerMapPos.x - 50, top: partnerMapPos.y + 30 }]}>
            <Text style={styles.cityLabelText}>{partnerLocation?.name}</Text>
          </View>
        </View>

        {/* Connection Info Card - Moved below map */}
        <View style={styles.infoCard}>
          <BlurView intensity={80} tint="dark" style={styles.infoBlur}>
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Distance</Text>
                </View>
                <Text style={styles.infoValue}>{Math.round(distance).toLocaleString()} km</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Plane size={14} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Flight Time</Text>
                </View>
                <Text style={styles.infoValue}>
                  ~{flightHours}h {flightMinutes > 0 ? `${flightMinutes}m` : ''}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Location Cards */}
        <View style={styles.locationsContainer}>
          {/* My Location */}
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => setEditing('my')}
            activeOpacity={0.8}
          >
            <BlurView intensity={60} tint="dark" style={styles.locationBlur}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.locationLabel}>You</Text>
                <Edit3 size={12} color="rgba(255, 255, 255, 0.4)" />
              </View>
              {editing === 'my' ? (
                <TextInput
                  style={styles.locationInput}
                  value={myNickname}
                  onChangeText={setMyNickname}
                  onBlur={() => handleSave('my')}
                  autoFocus
                  maxLength={20}
                  placeholder={myLocation?.name}
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              ) : (
                <Text style={styles.locationName} numberOfLines={1}>
                  {myNickname || myLocation?.name || 'Not set'}
                </Text>
              )}
              <Text style={styles.locationCity}>{myLocation?.name}</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Partner Location */}
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => setEditing('partner')}
            activeOpacity={0.8}
          >
            <BlurView intensity={60} tint="dark" style={styles.locationBlur}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationDot, { backgroundColor: '#ec4899' }]} />
                <Text style={styles.locationLabel}>Partner</Text>
                <Edit3 size={12} color="rgba(255, 255, 255, 0.4)" />
              </View>
              {editing === 'partner' ? (
                <TextInput
                  style={styles.locationInput}
                  value={partnerNickname}
                  onChangeText={setPartnerNickname}
                  onBlur={() => handleSave('partner')}
                  autoFocus
                  maxLength={20}
                  placeholder={partnerLocation?.name}
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              ) : (
                <Text style={styles.locationName} numberOfLines={1}>
                  {partnerNickname || partnerLocation?.name || 'Not set'}
                </Text>
              )}
              <Text style={styles.locationCity}>{partnerLocation?.name}</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Reset Connection Button */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={() => setShowResetConfirm(true)}
            style={styles.resetButton}
          >
            <BlurView intensity={30} tint="dark" style={styles.resetButtonBlur}>
              <Text style={styles.resetButtonText}>Break Connection</Text>
              <Text style={styles.resetButtonHint}>Reset and start over</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.resetOverlay}
          >
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.resetModal}>
                <Text style={styles.resetTitle}>Break Connection?</Text>
                <Text style={styles.resetMessage}>
                  This will disconnect both locations and return you to the beginning.
                </Text>
                <Text style={styles.resetInstruction}>
                  Hold the button below to confirm
                </Text>

                <TouchableOpacity
                  style={styles.holdButton}
                  onPressIn={handleResetHold}
                  onPressOut={() => setResetProgress(0)}
                  activeOpacity={0.9}
                >
                  <View style={styles.holdButtonInner}>
                    <View style={[styles.holdProgress, { width: `${resetProgress}%` }]} />
                    <Text style={styles.holdButtonText}>
                      {resetProgress > 0 ? 'Hold to Break...' : 'Hold to Confirm'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowResetConfirm(false);
                    setResetProgress(0);
                  }}
                  style={styles.cancelResetButton}
                >
                  <Text style={styles.cancelResetText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <BlurView intensity={30} tint="dark" style={styles.closeButtonBlur}>
            <X size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  mapBackground: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 20,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
  },
  flightSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  plane: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cityLabel: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
  },
  cityLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  infoCard: {
    position: 'absolute',
    top: 500,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 5,
  },
  infoBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 12,
  },
  locationsContainer: {
    position: 'absolute',
    top: 600,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 5,
  },
  locationCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  locationBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationLabel: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  locationInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#06b6d4',
  },
  locationCity: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  resetButtonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  resetButtonHint: {
    fontSize: 11,
    color: 'rgba(239, 68, 68, 0.6)',
  },
  resetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  resetModal: {
    width: SCREEN_WIDTH - 60,
    padding: 30,
    alignItems: 'center',
  },
  resetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  resetMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  resetInstruction: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  holdButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  holdButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  holdButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    zIndex: 1,
  },
  cancelResetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelResetText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
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
