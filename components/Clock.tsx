import React, { useState, useEffect } from 'react';

interface ClockProps {
  timeZone: string;
}

const Clock: React.FC<ClockProps> = ({ timeZone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZone,
  });

  const timeParts = formattedTime.split(':');

  return (
    <div className="text-7xl sm:text-8xl font-thin tracking-tighter tabular-nums">
      <span>{timeParts[0]}</span>
      <span className="animate-pulse">:</span>
      <span>{timeParts[1]}</span>
    </div>
  );
};

export default Clock;