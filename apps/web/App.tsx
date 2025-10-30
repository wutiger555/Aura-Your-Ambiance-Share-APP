import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LocationData, WeatherData, getCoordinatesForCity, getCityForCoordinates, getWeather, calculateDistance, calculateTimeDifference } from '@aura/shared';
import TimeBridge from './components/MapPeek';
import { Loader2, MapPin, Settings, X, Check, RefreshCw, ArrowRight, ArrowLeft, Globe, Clock as ClockIcon, Moon, Sun, Coffee } from 'lucide-react';
import { getSemanticTimeOfDay } from './utils/locationUtils';
import { getWeatherAtmosphere } from './utils/weatherUtils';
import Clock from './components/Clock';

// --- Helper Components defined in-file to avoid creating new files ---

const ConnectionIntro: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsConnecting(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`h-screen w-screen flex flex-col items-center justify-center starry-sky connected text-white p-4 relative overflow-hidden ${isConnecting ? 'connecting' : ''}`}>
            {/* Markers for animation */}
            <div className={`marker marker-my visible`} />
            <div className={`marker marker-partner visible`} />
            <div className="connection-flash" />

            {/* Added a subtle text fade-in */}
            <div className="text-center z-20 animate-fade-in" style={{animationDelay: '0.5s'}}>
                 <h1 className="text-3xl font-bold">Aura</h1>
                 <p className="text-lg text-slate-300 mt-2">Reconnecting worlds...</p>
            </div>
        </div>
    );
};

const CelestialSky: React.FC<{ weather: WeatherData; isTop: boolean; }> = ({ weather, isTop }) => {
    const celestialPosition = useMemo(() => {
        if (!weather) return { rotation: 0, bodyColor: 'rgba(255, 255, 255, 0.7)' };
        
        // Easing function for a more natural celestial path
        const easeInOutSine = (x: number): number => {
            return -(Math.cos(Math.PI * x) - 1) / 2;
        };

        const now = new Date(weather.current.time);
        const sunrise = new Date(weather.daily.sunrise[0]);
        const sunset = new Date(weather.daily.sunset[0]);

        let totalDuration: number, elapsed: number;
        let bodyColor = 'rgba(255, 239, 186, 0.8)'; // Sun

        if (weather.current.is_day === 1) {
            totalDuration = sunset.getTime() - sunrise.getTime();
            elapsed = now.getTime() - sunrise.getTime();
        } else {
            bodyColor = 'rgba(203, 213, 225, 0.7)'; // Moon
            const yesterdaySunset = new Date(sunset.getTime() - 24 * 60 * 60 * 1000);
            const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
            if (now < sunrise) { // After midnight, before sunrise
                totalDuration = sunrise.getTime() - yesterdaySunset.getTime();
                elapsed = now.getTime() - yesterdaySunset.getTime();
            } else { // After sunset, before midnight
                totalDuration = nextSunrise.getTime() - sunset.getTime();
                elapsed = now.getTime() - sunset.getTime();
            }
        }
        
        const linearPercentage = Math.max(0, Math.min(1, elapsed / totalDuration));
        
        // Apply the easing function to the percentage
        const easedPercentage = easeInOutSine(linearPercentage);

        const rotation = isTop ? 180 - easedPercentage * 180 : easedPercentage * 180;
        
        return { rotation, bodyColor };
    }, [weather, isTop]);

    return (
        <div className={`celestial-path ${isTop ? 'top' : 'bottom'}`}>
            <div 
                className="celestial-body" 
                style={{
                    '--celestial-rotation': `${celestialPosition.rotation}deg`,
                    background: `radial-gradient(circle, ${celestialPosition.bodyColor} 0%, rgba(255,255,255,0) 60%)`
                } as React.CSSProperties}
            />
        </div>
    );
};

const AuraGlobe: React.FC<{location: LocationData | null, weather: WeatherData | null, position: 'top' | 'bottom'}> = ({ location, weather, position }) => {
    const atmosphere = weather ? getWeatherAtmosphere(weather.current.weather_code, weather.current.is_day === 1) : null;
    const isTop = position === 'top';

    const timeStatus = useMemo(() => {
        if (!weather) return null;
        const hour = new Date(weather.current.time).getHours();
        return getSemanticTimeOfDay(hour);
    }, [weather]);
    
    return (
        <div className={`absolute z-10 flex flex-col items-center text-center text-white text-shadow p-4 animate-fade-in-up ${isTop ? 'top-12' : 'bottom-12'} left-0 right-0 mx-auto w-full max-w-xs sm:max-w-sm`}>
             <div className="w-full flex flex-col items-center justify-center p-4 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{location?.name || '...'}</h1>
                {weather ? <Clock timeZone={weather.timezone} /> : <div className="text-7xl sm:text-8xl font-thin tracking-tighter">--:--</div>}
                
                {timeStatus && (
                    <div className="flex items-center gap-2 text-white/80 -mt-2">
                        {timeStatus.icon}
                        <span className="text-sm sm:text-base font-light">{timeStatus.status}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <span className="text-5xl sm:text-6xl font-light">{atmosphere ? `${Math.round(weather!.current.temperature_2m)}°` : '--°'}</span>
                    <div className="flex flex-col items-start">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${atmosphere?.animationClass}`}>{atmosphere?.icon}</div>
                        <span className="text-base sm:text-lg font-light text-white/80 mt-1">{atmosphere?.description}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Heartline: React.FC<{distance: number | null, timeDifference: number | null, onShowDetails: () => void}> = ({ distance, timeDifference, onShowDetails }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
                 <path d="M 50,85 Q 80,50 50,15" stroke="rgba(255,255,255,0.4)" strokeWidth="0.2" fill="none" className="animate-flow"/>
            </svg>
            <button
                onClick={onShowDetails}
                className="pointer-events-auto heartline-button rounded-full px-4 py-2 flex items-center gap-3 sm:gap-4 text-sm"
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
                        <span>{timeDifference >= 0 ? '+' : ''}{timeDifference}h</span>
                    </div>
                )}
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [myLocation, setMyLocation] = useState<LocationData | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationData | null>(null);
  const [myWeather, setMyWeather] = useState<WeatherData | null>(null);
  const [partnerWeather, setPartnerWeather] = useState<WeatherData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isTimeBridgeOpen, setIsTimeBridgeOpen] = useState(false);
  
  const [showIntroAnimation, setShowIntroAnimation] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const distance = myLocation && partnerLocation ? calculateDistance(myLocation, partnerLocation) : null;
  const timeDifference = myWeather && partnerWeather ? calculateTimeDifference(myWeather.timezone, partnerWeather.timezone) : null;

  const fetchAllWeatherData = useCallback(async () => {
    if (!myLocation || !partnerLocation) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [myWeatherResponse, partnerWeatherResponse] = await Promise.all([
        getWeather(myLocation.latitude, myLocation.longitude),
        getWeather(partnerLocation.latitude, partnerLocation.longitude)
      ]);
      setMyWeather(myWeatherResponse);
      setPartnerWeather(partnerWeatherResponse);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [myLocation, partnerLocation]);

  useEffect(() => {
    try {
      const savedMyLocation = localStorage.getItem('myLocation');
      const savedPartnerLocation = localStorage.getItem('partnerLocation');

      if (savedMyLocation && savedPartnerLocation) {
        setMyLocation(JSON.parse(savedMyLocation));
        setPartnerLocation(JSON.parse(savedPartnerLocation));
        setIsSetup(true);
        setShowIntroAnimation(true);
        
        setTimeout(() => {
            setShowIntroAnimation(false);
            setIsInitialLoad(false);
        }, 3000); // Duration of intro animation
      } else {
        setIsSetup(false);
        setIsInitialLoad(false);
      }
    } catch (e) {
      console.error("Failed to parse location from localStorage", e);
      setIsSetup(false);
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSetup && !isInitialLoad && myLocation && partnerLocation) {
      fetchAllWeatherData();
    }
  }, [isSetup, isInitialLoad, myLocation, partnerLocation, fetchAllWeatherData]);

  const handleSetupComplete = (me: LocationData, partner: LocationData) => {
    localStorage.setItem('myLocation', JSON.stringify(me));
    localStorage.setItem('partnerLocation', JSON.stringify(partner));
    setMyLocation(me);
    setPartnerLocation(partner);
    setIsSetup(true);
    setIsSettingOpen(false);
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your locations? This will clear your current connection.')) {
        localStorage.removeItem('myLocation');
        localStorage.removeItem('partnerLocation');
        setMyLocation(null);
        setPartnerLocation(null);
        setMyWeather(null);
        setPartnerWeather(null);
        setIsSetup(false);
        setIsSettingOpen(false); // Close settings to go back to the setup intro
    }
  };

  const myAtmosphere = myWeather ? getWeatherAtmosphere(myWeather.current.weather_code, myWeather.current.is_day === 1, distance) : { gradient: 'from-slate-700 to-slate-900' };
  const partnerAtmosphere = partnerWeather ? getWeatherAtmosphere(partnerWeather.current.weather_code, partnerWeather.current.is_day === 1, distance) : { gradient: 'from-slate-800 to-black' };

  if (showIntroAnimation) {
      return <ConnectionIntro />;
  }

  if (!isSetup || isSettingOpen) {
    return (
      <SetupScreen 
        onSetupComplete={handleSetupComplete} 
        onCancel={isSetup ? () => setIsSettingOpen(false) : undefined}
        onReset={isSetup ? handleReset : undefined}
        isEditing={isSetup}
        initialMyLocation={myLocation}
        initialPartnerLocation={partnerLocation}
      />
    );
  }

  return (
    <div className={`h-screen w-full text-white overflow-hidden starry-sky connected relative ${!isInitialLoad ? 'animate-fade-in' : 'opacity-0'}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
        </div>
      )}
      {error && (
         <div className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 text-sm animate-fade-in">
          <p>{error}</p>
        </div>
      )}
      <button onClick={() => setIsSettingOpen(true)} className="absolute top-4 right-4 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
        <Settings className="h-5 w-5 sm:h-6 sm:w-6"/>
      </button>

      <div className="blended-sky">
        <div className={`sky-half top bg-gradient-to-br ${partnerAtmosphere.gradient} animate-shimmer`}>
          {partnerWeather && <CelestialSky weather={partnerWeather} isTop={true} />}
        </div>
        <div className={`sky-half bottom bg-gradient-to-br ${myAtmosphere.gradient} animate-shimmer`}>
          {myWeather && <CelestialSky weather={myWeather} isTop={false} />}
          <div className="particles">
              {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="particle" style={{
                      '--x-start': `${Math.random() * 100}vw`, '--y-start': `${Math.random() * 100}vh`,
                      '--x-end': `${Math.random() * 100}vw`, '--y-end': `${Math.random() * 100}vh`,
                      '--opacity-max': `${Math.random() * 0.3 + 0.1}`,
                      width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                      animationDelay: `${Math.random() * 20}s`, animationDuration: `${Math.random() * 20 + 15}s`
                  } as React.CSSProperties} />
              ))}
          </div>
        </div>
      </div>

      <AuraGlobe position="bottom" location={myLocation} weather={myWeather} />
      <AuraGlobe position="top" location={partnerLocation} weather={partnerWeather} />
      
      <Heartline distance={distance} timeDifference={timeDifference} onShowDetails={() => setIsTimeBridgeOpen(true)} />

      {isTimeBridgeOpen && myLocation && partnerLocation && (
        <TimeBridge
          myLocation={myLocation}
          partnerLocation={partnerLocation}
          myWeather={myWeather}
          partnerWeather={partnerWeather}
          distance={distance}
          timeDifference={timeDifference}
          onClose={() => setIsTimeBridgeOpen(false)}
        />
      )}
    </div>
  );
};

// --- SETUP SCREEN ---

interface SetupScreenProps {
    onSetupComplete: (me: LocationData, partner: LocationData) => void;
    onCancel?: () => void;
    onReset?: () => void;
    isEditing: boolean;
    initialMyLocation: LocationData | null;
    initialPartnerLocation: LocationData | null;
}

const AuraLogo: React.FC<{isComplete?: boolean}> = ({ isComplete = false }) => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-48 h-48 sm:w-56 sm:h-56">
        <defs>
            <linearGradient id="auraGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="30%" stopColor="#FBCFE8" />
                <stop offset="55%" stopColor="#C7D2FE" />
                <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            <filter id="sunGlow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" className={isComplete ? 'animate-draw-ring' : ''} style={{animationDelay: '0.2s'}}/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" className={isComplete ? 'animate-draw-ring' : ''}/>
        </g>

        <circle cx="50" cy="50" r="45" fill="url(#auraGradient)" />
        <circle cx="50" cy="50" r="5" fill="#fefce8" filter="url(#sunGlow)" className={isComplete ? 'animate-pulse-sun' : ''} />
    </svg>
);


const LocationInput: React.FC<{onLocationSet: (loc: LocationData) => void; title: string; subtitle: string; allowGeolocation: boolean; onBack?: () => void;}> = ({onLocationSet, title, subtitle, allowGeolocation, onBack}) => {
    const [city, setCity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<LocationData | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city) return;
        setIsLoading(true);
        setError(null);
        setConfirmation(null);
        try {
            const locationData = await getCoordinatesForCity(city);
            if (!locationData) {
                throw new Error("Could not find that city. Please check the spelling.");
            }
            
            if (locationData.name.toLowerCase() === city.toLowerCase()) {
                onLocationSet(locationData);
            } else {
                setConfirmation(locationData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = () => {
        if (confirmation) {
            onLocationSet(confirmation);
            setConfirmation(null);
        }
    };

    const handleRetry = () => {
        setConfirmation(null);
        setError(null);
        setCity('');
    };
    
    const handleUseMyLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }
      setIsLocating(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
              const cityName = await getCityForCoordinates(latitude, longitude);
              if (!cityName) throw new Error("Could not determine city from coordinates.");
              onLocationSet({ latitude, longitude, name: cityName });
          } catch (e) {
              console.error("Geolocation reverse lookup failed:", e);
              setError("Could not determine your city. Please enter it manually.");
          } finally {
              setIsLocating(false);
          }
        },
        () => {
          setError("Unable to retrieve your location. Permission denied.");
          setIsLocating(false);
        }
      );
    };

    if (confirmation) {
      return (
        <div className="w-full max-w-md mx-auto text-center backdrop-blur-sm p-6 rounded-xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-white">Did you mean...</h2>
            <p className="text-4xl font-bold text-cyan-300 my-4 py-4 border-y border-slate-700">{confirmation.name}</p>
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={handleRetry} 
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition font-semibold"
                >
                    <X className="h-5 w-5" />
                    <span>Search Again</span>
                </button>
                <button 
                    onClick={handleConfirm} 
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition font-semibold"
                >
                    <Check className="h-5 w-5" />
                    <span>Yes, that's it!</span>
                </button>
            </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto text-center backdrop-blur-sm p-4 rounded-xl animate-fade-in-up">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            {onBack && (
                 <button type="button" onClick={onBack} className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition flex-shrink-0" title="Go back">
                    <ArrowLeft className="h-6 w-6 text-slate-300"/>
                 </button>
            )}
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter a city name..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
                required
                autoFocus
            />
            {allowGeolocation && (
              <button type="button" onClick={handleUseMyLocation} disabled={isLocating} className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition flex-shrink-0 disabled:opacity-50" title="Use my current location">
                  {isLocating ? <Loader2 className="h-6 w-6 animate-spin"/> : <MapPin className="h-6 w-6 text-slate-300"/>}
              </button>
            )}
            <button type="submit" disabled={isLoading || !city} className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition flex-shrink-0 disabled:opacity-50 disabled:bg-cyan-800/50">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <ArrowRight className="h-6 w-6 text-white"/>}
            </button>
        </form>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    );
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete, onCancel, onReset, isEditing, initialMyLocation, initialPartnerLocation }) => {
    const [step, setStep] = useState(isEditing ? 'inputMy' : 'intro');
    const [myLocation, setMyLocation] = useState<LocationData | null>(initialMyLocation);
    const [partnerLocation, setPartnerLocation] = useState<LocationData | null>(initialPartnerLocation);
    const [markersVisible, setMarkersVisible] = useState({ my: isEditing, partner: isEditing });
    const [isBackgroundConnected, setIsBackgroundConnected] = useState(isEditing);

    useEffect(() => {
        if (step === 'connecting') {
            const bgTimer = setTimeout(() => setIsBackgroundConnected(true), 1500);
            const stepTimer = setTimeout(() => {
                setStep('confirm');
            }, 3000); // 1.5s for stream + 1.5s for flash
            return () => {
                clearTimeout(bgTimer);
                clearTimeout(stepTimer);
            };
        }
    }, [step]);
    
    const handleSetMyLocation = (loc: LocationData) => {
      setMyLocation(loc);
      setMarkersVisible(prev => ({ ...prev, my: true }));
      setStep('inputPartner');
    };
    
    const handleSetPartnerLocation = (loc: LocationData) => {
      setPartnerLocation(loc);
      setMarkersVisible(prev => ({ ...prev, partner: true }));
      // Give the marker time to appear before starting the connection animation
      setTimeout(() => {
          setStep('connecting');
      }, 800);
    };

    const handleConfirmConnection = () => {
        if (myLocation && partnerLocation) {
            onSetupComplete(myLocation, partnerLocation);
        }
    };
    
     const renderIntro = () => (
        <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in">
            <AuraLogo />
            <h1 className="text-5xl font-bold mt-2 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 text-transparent bg-clip-text" style={{letterSpacing: '0.1em'}}>Aura</h1>
            <p className="text-lg text-slate-300 mt-2 max-w-sm">Two worlds, one sky. A shared breath across the distance.</p>
            <button 
                onClick={() => setStep('inputMy')}
                className="mt-12 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]"
            >
                {isEditing ? 'Edit Locations' : 'Weave Your Connection'}
            </button>
        </div>
    );

    const renderInput = () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {step === 'inputMy' && <LocationInput onLocationSet={handleSetMyLocation} title="Pinpoint Your Star" subtitle="Where in the cosmos are you?" allowGeolocation={true} onBack={isEditing ? () => setStep('confirm') : () => setStep('intro')} />}
            {step === 'inputPartner' && <LocationInput onLocationSet={handleSetPartnerLocation} title="Find Their Constellation" subtitle="And where does your heart reside?" allowGeolocation={false} onBack={() => setStep('inputMy')} />}
        </div>
    );
    
    const renderConnecting = () => (
        <div className="text-center flex flex-col items-center justify-center h-full">
            {/* This space is intentionally left blank to focus on the background animation */}
        </div>
    );

    const renderConfirm = () => (
        <div className="text-center flex flex-col items-center justify-center h-full">
            <div className="animate-fade-in">
                <AuraLogo isComplete={true} />
            </div>
            <h2 className="text-3xl font-bold text-white mt-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>Your worlds are aligned.</h2>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-slate-300 mt-2 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <span className="font-semibold text-cyan-300">{myLocation?.name || '...'}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 7L21 12L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 17L3 12L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span className="font-semibold text-pink-300">{partnerLocation?.name || '...'}</span>
            </div>
            <button
                onClick={handleConfirmConnection}
                className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-fade-in-up"
                style={{animationDelay: '0.6s'}}
            >
                {isEditing ? 'Update Aura' : 'Enter Your Aura'}
            </button>
            {isEditing && onReset && (
                <div className="flex flex-col items-center mt-4 space-y-2 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                     <button
                        type="button"
                        onClick={onReset}
                        className="text-rose-400 hover:text-rose-300 text-sm font-semibold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                    >
                       <RefreshCw className="h-4 w-4"/> Reset Connection
                    </button>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (step) {
            case 'intro': return renderIntro();
            case 'inputMy':
            case 'inputPartner': return renderInput();
            case 'connecting': return renderConnecting();
            case 'confirm': return renderConfirm();
            default: return renderIntro();
        }
    }

    return (
        <div className={`h-screen w-screen flex flex-col items-center justify-center starry-sky text-white p-4 relative overflow-hidden ${step === 'connecting' ? 'connecting' : ''} ${isBackgroundConnected ? 'connected' : ''}`}>
            {onCancel && (
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-30">
                    <X/>
                </button>
            )}
            
            {/* Markers for animation */}
            <div className={`marker marker-my ${markersVisible.my ? 'visible' : ''}`} />
            <div className={`marker marker-partner ${markersVisible.partner ? 'visible' : ''}`} />
            
            {/* Streaming light animation */}
            {step === 'connecting' && (
                <svg width="100%" height="100%" className="absolute inset-0 z-10 pointer-events-none">
                    <defs>
                        <linearGradient id="my-stream-gradient" gradientTransform="rotate(90)">
                        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0" />
                        <stop offset="100%" stopColor="#67e8f9" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="partner-stream-gradient" gradientTransform="rotate(90)">
                        <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0" />
                        <stop offset="100%" stopColor="#f9a8d4" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path d="M 20vw, 80vh C 30vw, 50vh, 40vw, 50vh, 50vw, 50vh" stroke="url(#my-stream-gradient)" strokeWidth="2" fill="none" className="animate-stream" />
                    <path d="M 80vw, 20vh C 70vw, 50vh, 60vw, 50vh, 50vw, 50vh" stroke="url(#partner-stream-gradient)" strokeWidth="2" fill="none" className="animate-stream" style={{animationDelay: '0.1s'}} />
                </svg>
            )}

            <div className="connection-flash" />

            {renderContent()}
        </div>
    );
};

export default App;