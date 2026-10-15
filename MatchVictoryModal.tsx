import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, ArrowRight, Zap, Coins, Award, Sparkles, Check } from 'lucide-react';
import { triggerHaptic } from './haptics.ts';

interface MatchVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRematch?: () => void;
  gameTitle?: string;
  score?: number;
  xpEarned?: number;
  coinsEarned?: number;
  botsNeutralized?: number;
  damageDealt?: number;
  modeLabel?: string;
}

// Exactly 28 lightweight confetti pieces (<= 30) with precalculated coordinates to avoid layout reflows
const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, index) => {
  const colors = ['#a855f7', '#3b82f6', '#22d3ee', '#c084fc', '#f59e0b', '#ec4899', '#10b981'];
  const color = colors[index % colors.length];
  const left = (index * 3.6 + ((index * 7) % 15)).toFixed(1); // Spread across 0-100%
  const size = (index % 3 === 0 ? 8 : index % 3 === 1 ? 6 : 10);
  const isCircle = index % 4 === 0;
  const animDelay = (index * 35) % 450;
  const animDuration = 1800 + ((index * 90) % 900);
  const driftX = ((index % 2 === 0 ? 1 : -1) * (20 + (index * 5) % 60));

  return {
    id: index,
    color,
    left: `${left}%`,
    size,
    isCircle,
    animDelay: `${animDelay}ms`,
    animDuration: `${animDuration}ms`,
    driftX: `${driftX}px`
  };
});

export const MatchVictoryModal: React.FC<MatchVictoryModalProps> = ({
  isOpen,
  onClose,
  onRematch,
  gameTitle = 'Encarto Mecha Strike',
  score = 2450,
  xpEarned = 150,
  coinsEarned = 35,
  botsNeutralized = 1,
  damageDealt = 850,
  modeLabel = 'Competitive Bot Duel'
}) => {
  // Strict rule: Confetti made from at most 30 small CSS-animated divs removed from the DOM after 3 seconds
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger triumphant haptic response
    triggerHaptic('success');
    setShowConfetti(true);

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false); // Cleanly removed from DOM after 3.0 seconds
    }, 3000);

    return () => clearTimeout(confettiTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* 28 Confetti Particles (Strictly removed from DOM after 3s) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[101]">
          {CONFETTI_PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute top-0 opacity-0 animate-confetti-fall"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.isCircle ? p.size : p.size * 1.5}px`,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
                animationDelay: p.animDelay,
                animationDuration: p.animDuration,
                transform: `translateX(${p.driftX})`,
                boxShadow: `0 0 8px ${p.color}`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Surface */}
      <div 
        className="relative w-full max-w-lg bg-[#0b0b2b]/95 border border-purple-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.45)] overflow-hidden animate-pop-in"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Triumphant Cyber Trophy Icon */}
        <div className="relative inline-flex items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_28px_rgba(192,132,252,0.8)] border border-purple-300/40 animate-pulse-glow">
            <div className="w-full h-full bg-[#07051a] rounded-[14px] flex items-center justify-center">
              <Trophy size={32} className="text-amber-300 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            </div>
          </div>
        </div>

        {/* "VICTORY" title scales in with a glow */}
        <h2 className="font-heading text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-200 uppercase tracking-widest animate-victory-title drop-shadow-[0_0_24px_rgba(192,132,252,0.9)]">
          VICTORY
        </h2>

        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-300/90 mt-1">
          {gameTitle} • <span className="text-purple-300">{modeLabel}</span>
        </p>

        {/* Rewards Ribbon */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Sparkles size={14} className="text-purple-300 animate-spin-slow" />
            <span className="font-mono font-bold text-xs">+{xpEarned} XP</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-cyan-400/40 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            <Coins size={14} className="text-cyan-300" />
            <span className="font-mono font-bold text-xs">+{coinsEarned} M3GA</span>
          </div>
        </div>

        {/* Match Breakdown Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-6 text-left">
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70 block">Total Score</span>
            <span className="font-mono font-black text-lg sm:text-xl text-white">{score.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70 block">Enemies Neutralized</span>
            <span className="font-mono font-black text-lg sm:text-xl text-cyan-300">{botsNeutralized}</span>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70 block">Damage Output</span>
            <span className="font-mono font-black text-lg sm:text-xl text-purple-200">{damageDealt.toLocaleString()} HP</span>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/70 block">Match Status</span>
            <span className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1 mt-0.5">
              <Check size={14} /> AUTHORITATIVE WIN
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          {onRematch && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onRematch();
              }}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-black text-xs uppercase tracking-widest border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Instant Rematch</span>
            </button>
          )}
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-300 text-white font-heading font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Return to Hub</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
