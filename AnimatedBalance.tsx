import React, { useEffect, useState, useRef } from 'react';
import { CreditCard } from 'lucide-react';

interface AnimatedBalanceProps {
  balance: number;
  onClick?: () => void;
  className?: string;
}

export const AnimatedBalance: React.FC<AnimatedBalanceProps> = ({ balance, onClick, className = '' }) => {
  const [displayValue, setDisplayValue] = useState<number>(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevBalanceRef = useRef<number>(balance);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = prevBalanceRef.current;
    const endVal = balance;
    prevBalanceRef.current = balance;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    setIsAnimating(true);
    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        setIsAnimating(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [balance]);

  return (
    <button
      onClick={onClick}
      type="button"
      className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-[#0b0b2b]/85 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-200 cursor-pointer min-h-[44px] ${className}`}
      title="M3GA Balance - Click to manage wallet"
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-transform">
        <CreditCard className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="flex items-baseline gap-1.5 font-mono">
        <span
          className={`text-sm sm:text-base font-extrabold tabular-nums tracking-tight transition-colors ${
            isAnimating
              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
              : 'text-[#f5f3ff] group-hover:text-cyan-200'
          }`}
        >
          {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
          M3GA
        </span>
      </div>
    </button>
  );
};
