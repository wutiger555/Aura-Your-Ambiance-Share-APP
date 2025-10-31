import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { WeatherData } from '@aura/shared';
import { getWeatherAtmosphere } from '../../utils/weatherUtils';
import CelestialSky from './CelestialSky';
import ParticleSystem from './ParticleSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BlendedSkyProps {
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  distance: number | null;
}

/**
 * BlendedSky - Blended gradient sky system matching web design
 * Uses MaskedView to create smooth gradient blending between two weather states
 */
const BlendedSky: React.FC<BlendedSkyProps> = ({
  myWeather,
  partnerWeather,
  distance,
}) => {
  // Get gradient colors for each weather
  const myAtmosphere = myWeather
    ? getWeatherAtmosphere(
        myWeather.current.weather_code,
        myWeather.current.is_day === 1,
        distance
      )
    : null;

  const partnerAtmosphere = partnerWeather
    ? getWeatherAtmosphere(
        partnerWeather.current.weather_code,
        partnerWeather.current.is_day === 1,
        distance
      )
    : null;

  // Get gradient colors - now directly from atmosphere.gradient which is already a tuple
  const partnerColors = partnerAtmosphere?.gradient || ['#64748b', '#334155'];
  const myColors = myAtmosphere?.gradient || ['#64748b', '#334155'];

  return (
    <View style={styles.container}>
      {/* Top half (partner weather) with mask */}
      <MaskedView
        style={styles.topHalf}
        maskElement={
          <LinearGradient
            colors={['black', 'transparent']}
            locations={[0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <LinearGradient
          colors={partnerColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Particles for top half */}
        <ParticleSystem count={4} color="rgba(255, 255, 255, 0.3)" />
        {/* Celestial body for top half */}
        {partnerWeather && (
          <CelestialSky weather={partnerWeather} isTop={true} />
        )}
      </MaskedView>

      {/* Bottom half (my weather) with mask */}
      <MaskedView
        style={styles.bottomHalf}
        maskElement={
          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0, 0.3]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <LinearGradient
          colors={myColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Particles for bottom half */}
        <ParticleSystem count={4} color="rgba(255, 255, 255, 0.3)" />
        {/* Celestial body for bottom half */}
        {myWeather && <CelestialSky weather={myWeather} isTop={false} />}
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.55, // 55% with overlap for smooth blend
  },
  bottomHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.55, // 55% with overlap for smooth blend
  },
});

export default BlendedSky;
