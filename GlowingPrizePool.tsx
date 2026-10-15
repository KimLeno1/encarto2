import React, { useEffect, useRef, useState } from 'react';

interface GlowingPrizePoolProps {
  amount: number;
  suffix?: string;
  prefix?: string;
  label?: string;
  className?: string;
}

export const GlowingPrizePool: React.FC<GlowingPrizePoolProps> = ({
  amount,
  suffix = 'M3GA',
  prefix = '',
  label = 'Championship Prize Pool',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const duration = 1600;
            const startTime = performance.now();

            const animateCount = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // easeOutExpo curve
              const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = Math.floor(easeOutProgress * amount);
              setDisplayValue(current);

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                setDisplayValue(amount);
              }
            };

            requestAnimationFrame(animateCount);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [amount, hasAnimated]);

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      {label && (
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a5b4fc] flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className="font-heading text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.65)] font-black tracking-tight">
          {prefix}{displayValue.toLocaleString()}
        </span>
        {suffix && (
          <span className="text-sm sm:text-lg font-black uppercase text-cyan-300 font-mono tracking-wider drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default GlowingPrizePool;
