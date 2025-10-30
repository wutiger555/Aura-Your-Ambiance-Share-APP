import React from 'react';
import { LocationData, WeatherData } from '../types';
import { X } from 'lucide-react';

// A new component for the 24h timeline visualization
const DailyTimeline: React.FC<{
  weather: WeatherData;
  label: string;
  colorClass: string;
}> = ({ weather, label, colorClass }) => {
  const now = new Date(weather.current.time);
  const sunrise = new Date(weather.daily.sunrise[0]);
  const sunset = new Date(weather.daily.sunset[0]);

  const totalMinutes = 24 * 60;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMinutes = sunrise.getHours() * 60 + sunrise.getMinutes();
  const sunsetMinutes = sunset.getHours() * 60 + sunset.getMinutes();

  const markerPosition = (nowMinutes / totalMinutes) * 100;
  
  // Handle night period that spans across midnight
  let nightStyles: React.CSSProperties[] = [];
  if (sunsetMinutes > sunriseMinutes) {
    // Standard case: sunset is later in the same day as sunrise
    nightStyles.push({ left: `${(sunsetMinutes / totalMinutes) * 100}%`, right: 0 });
    nightStyles.push({ left: 0, right: `${((totalMinutes - sunriseMinutes) / totalMinutes) * 100}%` });
  } else {
    // Inverted case: sunrise is later in the day (e.g. polar regions, or just crosses midnight)
    nightStyles.push({ left: `${(sunsetMinutes / totalMinutes) * 100}%`, right: `${((totalMinutes - sunriseMinutes) / totalMinutes) * 100}%` });
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className={`font-bold ${colorClass}`}>{label}</span>
        <span className="text-slate-400">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: weather.timezone })}</span>
      </div>
      <div className="timeline-container">
        <div className="timeline-bar">
          {nightStyles.map((style, index) => (
            <div key={index} className="timeline-night" style={style} />
          ))}
        </div>
        <div className="timeline-marker" style={{ left: `${markerPosition}%`, backgroundColor: colorClass.includes('cyan') ? '#67e8f9' : '#f9a8d4' }} />
      </div>
       <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>12AM</span>
          <span>6AM</span>
          <span>12PM</span>
          <span>6PM</span>
          <span>12AM</span>
        </div>
    </div>
  );
};

interface TimeBridgeProps {
  myLocation: LocationData;
  partnerLocation: LocationData;
  myWeather: WeatherData | null;
  partnerWeather: WeatherData | null;
  distance: number | null;
  timeDifference: number | null;
  onClose: () => void;
}

const TimeBridge: React.FC<TimeBridgeProps> = ({ myLocation, partnerLocation, myWeather, partnerWeather, distance, timeDifference, onClose }) => {

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-lg z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm m-4 text-white relative animate-fade-in-up flex flex-col items-center space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors z-10">
          <X />
        </button>
        <h3 className="text-xl font-bold text-center">Your Time Bridge</h3>
        
        <div className="w-full flex flex-col items-center justify-center gap-6">
            {myWeather && <DailyTimeline weather={myWeather} label={myLocation.name} colorClass="text-cyan-300" />}
            {partnerWeather && <DailyTimeline weather={partnerWeather} label={partnerLocation.name} colorClass="text-pink-300" />}
        </div>
        
        <div className="w-full flex justify-around text-center pt-4 border-t border-slate-700">
            {distance !== null && (
                 <div>
                    <div className="font-bold text-xl sm:text-2xl">{Math.round(distance).toLocaleString()}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Kilometers Apart</div>
                </div>
            )}
             {timeDifference !== null && (
                 <div>
                    <div className="font-bold text-xl sm:text-2xl">{timeDifference >= 0 ? '+' : ''}{timeDifference}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Hours Difference</div>
                </div>
            )}
        </div>
        
      </div>
    </div>
  );
};

export default TimeBridge;