import React, { useMemo } from 'react';
import { LocationData, WeatherData } from '../types';
import { getWeatherAtmosphere } from '../utils/weatherUtils';
import Clock from './Clock';
import { Sun, Sunset, Globe, Clock as ClockIcon } from 'lucide-react';

interface AuraPanelProps {
  title: string;
  location: LocationData | null;
  weather: WeatherData | null;
  distance?: number | null;
  timeDifference?: number | null;
  onShowMap?: () => void;
}

const getSemanticTime = (timeZone?: string): string => {
    if (!timeZone) return '';
    try {
        const hour = parseInt(new Date().toLocaleTimeString('en-US', { timeZone, hour: '2-digit', hour12: false, timeStyle: 'short' }));
        if (hour >= 23 || hour < 4) return 'Late Night';
        if (hour >= 4 && hour < 7) return 'Early Morning';
        if (hour >= 7 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 20) return 'Evening';
        if (hour >= 20 && hour < 23) return 'Night';
        return '';
    } catch (e) {
        return '';
    }
}

const AuraPanel: React.FC<AuraPanelProps> = ({ title, location, weather, distance, timeDifference, onShowMap }) => {
  const atmosphere = weather
    ? getWeatherAtmosphere(weather.current.weather_code, weather.current.is_day === 1, distance || null)
    : { gradient: 'from-slate-700 to-slate-900', icon: null, description: 'Loading...', animationClass: '' };

  const formatTime = (dateString?: string, timeZone?: string) => {
    if (!dateString || !timeZone) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone,
    });
  };

  const semanticTime = title === 'You' ? getSemanticTime(weather?.timezone) : '';
  
  const celestialPosition = useMemo(() => {
    if (!weather) return { rotation: 0, pathRotation: 180, bodyColor: 'rgba(255, 255, 255, 0.7)' };
    
    const now = new Date(weather.current.time);
    const sunrise = new Date(weather.daily.sunrise[0]);
    const sunset = new Date(weather.daily.sunset[0]);

    const isDay = weather.current.is_day === 1;

    let totalDuration: number;
    let elapsed: number;
    let bodyColor = 'rgba(255, 239, 186, 0.8)'; // Sun color

    if (isDay) {
        totalDuration = sunset.getTime() - sunrise.getTime();
        elapsed = now.getTime() - sunrise.getTime();
    } else {
        bodyColor = 'rgba(203, 213, 225, 0.7)'; // Moon color
        const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
        totalDuration = nextSunrise.getTime() - sunset.getTime();
        if (now < sunrise) { // After midnight, before sunrise
             elapsed = now.getTime() - new Date(sunset).setHours(0,0,0,0) + (24*60*60*1000 - (sunset.getTime() - new Date(sunset).setHours(0,0,0,0)));
             const yesterdaySunset = new Date(sunset.getTime() - 24 * 60 * 60 * 1000);
             totalDuration = sunrise.getTime() - yesterdaySunset.getTime();
             elapsed = now.getTime() - yesterdaySunset.getTime();
        } else { // After sunset, before midnight
            elapsed = now.getTime() - sunset.getTime();
        }
    }
    
    const percentage = Math.max(0, Math.min(1, elapsed / totalDuration));
    const rotation = percentage * 180;
    
    return { rotation, bodyColor };
  }, [weather]);

  return (
    <div className={`relative h-1/2 w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-all duration-1000 bg-gradient-to-br ${atmosphere.gradient} animate-shimmer overflow-hidden`}>
      {/* Living Background */}
      <div className="absolute inset-0 z-0">
          <div className="celestial-path" style={{'--path-rotation': `180deg`} as React.CSSProperties}>
              <div 
                  className="celestial-body" 
                  style={{
                      '--celestial-rotation': `${celestialPosition.rotation}deg`,
                       background: `radial-gradient(circle, ${celestialPosition.bodyColor} 0%, rgba(255,255,255,0) 60%)`
                  } as React.CSSProperties}
              />
          </div>
          <div className="particles">
              {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="particle" style={{
                      '--x-start': `${Math.random() * 100}vw`,
                      '--y-start': `${Math.random() * 100}vh`,
                      '--x-end': `${Math.random() * 100}vw`,
                      '--y-end': `${Math.random() * 100}vh`,
                      '--opacity-max': `${Math.random() * 0.3 + 0.1}`,
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      animationDelay: `${Math.random() * 20}s`,
                      animationDuration: `${Math.random() * 20 + 15}s`
                  } as React.CSSProperties} />
              ))}
          </div>
      </div>


      <div className="relative z-10 flex flex-col items-center text-center text-white text-shadow space-y-2 sm:space-y-4">
        <div className="flex flex-col items-center space-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase">{title}</h1>
            <h2 className="text-xl sm:text-2xl font-semibold">{location?.name || '...'}</h2>
        </div>
        
        <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {weather ? (
              <Clock timeZone={weather.timezone} />
            ) : (
              <div className="text-7xl sm:text-8xl font-thin tracking-tighter">--:--</div>
            )}
            {semanticTime && <p className="text-base sm:text-lg font-light text-white/80 -mt-2">{semanticTime}</p>}
        </div>

        {title === 'You' && onShowMap && (distance !== null || timeDifference !== null) && (
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <button 
                    onClick={onShowMap}
                    className="bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-4 transition-all text-sm transform hover:scale-105"
                >
                    {distance !== null && (
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-4 h-4" />
                            <span>{Math.round(distance).toLocaleString()} km</span>
                        </div>
                    )}
                    {distance !== null && timeDifference !== null && <div className="w-px h-4 bg-white/30" />}
                    {timeDifference !== null && (
                         <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            <span>Details</span>
                        </div>
                    )}
                </button>
            </div>
        )}

        <div className="flex flex-col items-center space-y-2 sm:space-y-4 pt-2 sm:pt-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-6xl sm:text-7xl font-thin">
                {weather ? `${Math.round(weather.current.temperature_2m)}°` : '--°'}
            </div>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${atmosphere.animationClass}`}>{atmosphere.icon}</div>
                <span className="text-xl sm:text-2xl font-light">{atmosphere.description}</span>
            </div>
        </div>

        {weather && (
             <div className="flex gap-6 sm:gap-8 text-base sm:text-lg font-light pt-3 sm:pt-4 mt-2 sm:mt-4 border-t border-white/20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-2">
                    <Sun className="w-6 h-6"/>
                    <span>{formatTime(weather.daily.sunrise[0], weather.timezone)}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Sunset className="w-6 h-6"/>
                    <span>{formatTime(weather.daily.sunset[0], weather.timezone)}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuraPanel;
