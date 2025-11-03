import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, MapPin, Edit3 } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LocationData, WeatherData } from '@aura/shared';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SettingsRedesignProps {
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
 * SettingsRedesign - Visual map-based settings interface
 * Shows locations on an interactive world map with elegant editing
 */
export default function SettingsRedesign({
  visible,
  onClose,
  onReset,
  myLocation,
  partnerLocation,
  myWeather,
  partnerWeather,
  onUpdateNicknames,
}: SettingsRedesignProps) {
  const [editing, setEditing] = useState<EditingLocation>(null);
  const [myNickname, setMyNickname] = useState(myLocation?.nickname || '');
  const [partnerNickname, setPartnerNickname] = useState(partnerLocation?.nickname || '');

  // Convert lat/long to screen coordinates
  const latLongToMapCoords = (lat: number, long: number) => {
    const x = ((long + 180) / 360) * SCREEN_WIDTH;
    const y = ((90 - lat) / 180) * (SCREEN_HEIGHT * 0.5);
    return { x, y };
  };

  const myMapPos = myLocation
    ? latLongToMapCoords(myLocation.latitude, myLocation.longitude)
    : { x: 100, y: 200 };

  const partnerMapPos = partnerLocation
    ? latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude)
    : { x: 300, y: 150 };

  // Connection curve path
  const centerX = SCREEN_WIDTH / 2;
  const curveControlX = SCREEN_WIDTH * 0.65;
  const connectionPath = `M ${myMapPos.x} ${myMapPos.y} Q ${curveControlX} ${centerX} ${partnerMapPos.x} ${partnerMapPos.y}`;

  const handleSave = () => {
    if (onUpdateNicknames) {
      onUpdateNicknames(myNickname.trim(), partnerNickname.trim());
    }
    setEditing(null);
  };

  const handleLocationPress = (location: 'my' | 'partner') => {
    setEditing(location);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Simple world map outline */}
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.6} style={styles.mapSvg}>
          <Defs>
            <SvgLinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </SvgLinearGradient>
          </Defs>

          {/* Connection line */}
          <Path
            d={connectionPath}
            stroke="url(#connectionGradient)"
            strokeWidth={2}
            fill="none"
            strokeDasharray="5,5"
          />

          {/* My location marker */}
          <Circle
            cx={myMapPos.x}
            cy={myMapPos.y}
            r={12}
            fill="rgba(6, 182, 212, 0.3)"
            stroke="#06b6d4"
            strokeWidth={2}
          />
          <Circle cx={myMapPos.x} cy={myMapPos.y} r={6} fill="#06b6d4" />

          {/* Partner location marker */}
          <Circle
            cx={partnerMapPos.x}
            cy={partnerMapPos.y}
            r={12}
            fill="rgba(139, 92, 246, 0.3)"
            stroke="#8b5cf6"
            strokeWidth={2}
          />
          <Circle cx={partnerMapPos.x} cy={partnerMapPos.y} r={6} fill="#8b5cf6" />
        </Svg>

        {/* Interactive location cards */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.cardsContainer}
        >
          {/* My location card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleLocationPress('my')}
            style={[styles.locationCardWrapper, { top: myMapPos.y + 20 }]}
          >
            <BlurView intensity={40} tint="dark" style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.colorDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.cardTitle}>Your Location</Text>
                <Edit3 size={14} color="rgba(255, 255, 255, 0.5)" />
              </View>
              <Text style={styles.cardLocation}>
                {myNickname || myLocation?.name || 'Not set'}
              </Text>
            </BlurView>
          </TouchableOpacity>

          {/* Partner location card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleLocationPress('partner')}
            style={[styles.locationCardWrapper, { top: partnerMapPos.y + 20 }]}
          >
            <BlurView intensity={40} tint="dark" style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.colorDot, { backgroundColor: '#8b5cf6' }]} />
                <Text style={styles.cardTitle}>Partner's Location</Text>
                <Edit3 size={14} color="rgba(255, 255, 255, 0.5)" />
              </View>
              <Text style={styles.cardLocation}>
                {partnerNickname || partnerLocation?.name || 'Not set'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* Editing modal */}
        {editing && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.editOverlay}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setEditing(null)}
              activeOpacity={1}
            />
            <Animated.View
              entering={SlideInDown.duration(300).springify()}
              exiting={SlideOutDown.duration(200)}
              style={styles.editPanel}
            >
              <BlurView intensity={60} tint="dark" style={styles.editBlur}>
                <View style={styles.editContent}>
                  <View style={styles.editHeader}>
                    <View style={styles.editHeaderLeft}>
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: editing === 'my' ? '#06b6d4' : '#8b5cf6',
                          },
                        ]}
                      />
                      <Text style={styles.editTitle}>
                        {editing === 'my' ? 'Your Location' : "Partner's Location"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setEditing(null)}>
                      <X size={20} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.editForm}>
                    <Text style={styles.editLabel}>Custom Name</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editing === 'my' ? myNickname : partnerNickname}
                      onChangeText={editing === 'my' ? setMyNickname : setPartnerNickname}
                      placeholder={
                        editing === 'my'
                          ? 'e.g., Home, My Place'
                          : 'e.g., My Love, Best Friend'
                      }
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      autoFocus
                    />

                    <View style={styles.editInfo}>
                      <MapPin size={14} color="rgba(255, 255, 255, 0.4)" />
                      <Text style={styles.editInfoText}>
                        {editing === 'my' ? myLocation?.name : partnerLocation?.name}
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        )}

        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <BlurView intensity={30} tint="dark" style={styles.closeButtonBlur}>
            <X size={24} color="white" />
          </BlurView>
        </TouchableOpacity>

        {/* Reset button */}
        <TouchableOpacity onPress={onReset} style={styles.resetButton}>
          <BlurView intensity={30} tint="dark" style={styles.resetButtonBlur}>
            <Text style={styles.resetButtonText}>Reset All</Text>
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
  mapSvg: {
    position: 'absolute',
    top: 80,
    left: 0,
  },
  cardsContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
  },
  locationCardWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  locationCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  editPanel: {
    maxHeight: '50%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  editBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editContent: {
    padding: 24,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  editHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  editForm: {
    gap: 16,
  },
  editLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  editInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  saveButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resetButtonBlur: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
