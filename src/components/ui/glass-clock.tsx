import React, { useEffect, useRef } from 'react';

export type SecondsMode = 'smooth' | 'tick1' | 'tick2' | 'highFreq';

const BERLIN_TIMEZONE = 'Europe/Berlin';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function GlassClock(): React.ReactElement {
  const hourMarksRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const secondHandContainerRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timezoneRef = useRef<HTMLDivElement>(null);

  const requestAnimationRef = useRef<number | null>(null);
  const hourMinuteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const createHourMarks = () => {
      const container = hourMarksRef.current;
      if (!container) return;

      container.innerHTML = '';

      for (let i = 0; i < 60; i += 1) {
        if (i % 5 === 0) {
          const hourIndex = i / 5;
          const hourNumber = document.createElement('div');
          hourNumber.className = 'absolute text-sm font-medium text-foreground/80';
          const angle = (i * 6 * Math.PI) / 180;
          const radius = 145;
          const left = 175 + Math.sin(angle) * radius - 15;
          const top = 175 - Math.cos(angle) * radius - 10;
          hourNumber.style.left = `${left}px`;
          hourNumber.style.top = `${top}px`;
          hourNumber.textContent = hourIndex === 0 ? '12' : hourIndex.toString();
          container.appendChild(hourNumber);
        }
      }
    };

    const updateHourAndMinuteHands = () => {
      const now = new Date();
      const berlinString = now.toLocaleString('en-US', {
        timeZone: BERLIN_TIMEZONE,
      });
      const berlinTime = new Date(berlinString);
      const hours = berlinTime.getHours() % 12;
      const minutes = berlinTime.getMinutes();
      const minutesDegrees = minutes * 6;
      const hoursDegrees = hours * 30 + (minutes / 60) * 30;

      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hoursDegrees}deg)`;
      }

      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minutesDegrees}deg)`;
      }

      if (dateRef.current) {
        const month = MONTH_NAMES[berlinTime.getMonth()];
        const day = berlinTime.getDate();
        dateRef.current.textContent = `${month} ${day}`;
      }

      if (timezoneRef.current) {
        timezoneRef.current.textContent = 'Berlin';
      }

      if (hourMinuteTimeoutRef.current) {
        clearTimeout(hourMinuteTimeoutRef.current);
      }

      const millisecondsUntilNextMinute =
        (60 - berlinTime.getSeconds()) * 1000 - berlinTime.getMilliseconds();

      hourMinuteTimeoutRef.current = window.setTimeout(
        updateHourAndMinuteHands,
        Math.max(millisecondsUntilNextMinute, 0),
      );
    };

    const applySecondHandRotation = (angle: number) => {
      if (secondHandContainerRef.current) {
        secondHandContainerRef.current.style.transition = 'none';
        secondHandContainerRef.current.style.transform = `rotate(${angle}deg)`;
      }
    };

    const cancelSecondHandAnimation = () => {
      if (requestAnimationRef.current !== null) {
        cancelAnimationFrame(requestAnimationRef.current);
        requestAnimationRef.current = null;
      }
    };

    const startSmoothSecondHand = () => {
      cancelSecondHandAnimation();

      const animate = () => {
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        const angle = seconds * 6 + (milliseconds / 1000) * 6;
        applySecondHandRotation(angle);
        requestAnimationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    createHourMarks();
    updateHourAndMinuteHands();
    startSmoothSecondHand();

    return () => {
      cancelSecondHandAnimation();
      if (hourMinuteTimeoutRef.current) {
        clearTimeout(hourMinuteTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-[350px] h-[350px] mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border border-border/50 shadow-2xl">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Hour marks */}
        <div className="absolute inset-0" ref={hourMarksRef} />
        
        {/* Hands */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Hour hand */}
            <div
              ref={hourHandRef}
              className="absolute left-1/2 top-1/2 w-1 h-20 -translate-x-1/2 -translate-y-full origin-bottom"
              style={{
                background: 'linear-gradient(to top, hsl(var(--foreground)) 0%, transparent 100%)',
                borderRadius: '2px',
              }}
            />
            
            {/* Minute hand */}
            <div
              ref={minuteHandRef}
              className="absolute left-1/2 top-1/2 w-0.5 h-28 -translate-x-1/2 -translate-y-full origin-bottom"
              style={{
                background: 'linear-gradient(to top, hsl(var(--foreground)) 0%, transparent 100%)',
                borderRadius: '2px',
              }}
            />
            
            {/* Second hand */}
            <div
              ref={secondHandContainerRef}
              className="absolute left-1/2 top-1/2 w-0.5 h-32 -translate-x-1/2 -translate-y-full origin-bottom"
              style={{
                background: 'linear-gradient(to top, hsl(var(--primary)) 0%, transparent 100%)',
                borderRadius: '2px',
              }}
            />
            
            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
          </div>
        </div>
        
        {/* Date and timezone */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div ref={dateRef} className="text-sm font-medium text-foreground/80" />
          <div ref={timezoneRef} className="text-xs text-muted-foreground mt-1" />
        </div>
      </div>
    </div>
  );
}

export default GlassClock;
