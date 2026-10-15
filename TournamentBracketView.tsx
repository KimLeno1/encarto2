import React, { useState } from 'react';
import { Trophy, Swords, Zap, CheckCircle2, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { TournamentBracketMatch } from './types.ts';

interface BracketNodeProps {
  id: string;
  roundName: string;
  matchNum: number;
  teamA: string;
  scoreA?: number;
  teamB: string;
  scoreB?: number;
  winner?: string;
  status: 'live' | 'upcoming' | 'completed';
  isGlowing?: boolean;
  onAdvanceWinner?: (winnerTeam: string) => void;
}

export const TournamentBracketView: React.FC<{ tournamentName?: string }> = ({ 
  tournamentName = 'Chrono Clash: Neon Masters Grand Cup' 
}) => {
  // Bracket matches state
  const [qf1Winner, setQf1Winner] = useState<string>('Team Aurora');
  const [qf2Winner, setQf2Winner] = useState<string>('Cyber Wolves');
  const [qf3Winner, setQf3Winner] = useState<string>('Plus Ultra');
  const [qf4Winner, setQf4Winner] = useState<string>('Shadow Strikers');

  const [semi1Winner, setSemi1Winner] = useState<string>('Team Aurora');
  const [semi2Winner, setSemi2Winner] = useState<string>('Plus Ultra');

  const [champion, setChampion] = useState<string>('Team Aurora');

  // Animation states for stroke-dashoffset and winner glowing card
  const [animatedLines, setAnimatedLines] = useState<{ [key: string]: boolean }>({
    'qf1-semi1': true,
    'qf2-semi1': true,
    'qf3-semi2': true,
    'qf4-semi2': true,
    'semi1-final': true,
    'semi2-final': true,
    'final-champ': true
  });

  const [glowingCards, setGlowingCards] = useState<{ [key: string]: boolean }>({});

  const triggerAdvance = (fromId: string, toTarget: string, winnerName: string, setter: (val: string) => void) => {
    // 1. Reset line dashoffset for target line
    setAnimatedLines(prev => ({ ...prev, [fromId]: false }));

    // 2. Animate line drawing
    setTimeout(() => {
      setAnimatedLines(prev => ({ ...prev, [fromId]: true }));
      setter(winnerName);

      // 3. Trigger brief glow on winner card
      setTimeout(() => {
        setGlowingCards(prev => ({ ...prev, [toTarget]: true }));
        setTimeout(() => {
          setGlowingCards(prev => ({ ...prev, [toTarget]: false }));
        }, 1800);
      }, 500);
    }, 50);
  };

  const handleReset = () => {
    setQf1Winner('Team Aurora');
    setQf2Winner('Cyber Wolves');
    setQf3Winner('Plus Ultra');
    setQf4Winner('Shadow Strikers');
    setSemi1Winner('Team Aurora');
    setSemi2Winner('Plus Ultra');
    setChampion('Team Aurora');
    setAnimatedLines({
      'qf1-semi1': true,
      'qf2-semi1': true,
      'qf3-semi2': true,
      'qf4-semi2': true,
      'semi1-final': true,
      'semi2-final': true,
      'final-champ': true
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Bracket Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b0b2b]/80 border border-purple-500/30">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
            <Shield size={12} /> Interactive Knockout Bracket
          </span>
          <h3 className="font-heading text-lg sm:text-xl text-white uppercase tracking-tight mt-0.5">
            {tournamentName}
          </h3>
          <p className="text-xs text-[#a5b4fc] font-normal">
            Click on team contenders to advance them — watch the connecting line draw in real-time!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw size={14} className="text-cyan-300" />
            <span>Reset Bracket</span>
          </button>
        </div>
      </div>

      {/* Bracket Tree Container: Horizontally scrollable on mobile with snap points per round, full layout on desktop */}
      <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 pt-2 px-1 custom-scrollbar">
        
        {/* ROUND 1: QUARTERFINALS */}
        <div className="snap-center shrink-0 w-[280px] sm:w-[300px] lg:w-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Quarterfinals
            </span>
            <span className="text-[10px] font-mono text-[#a5b4fc]">Round 1</span>
          </div>

          <div className="space-y-4">
            {/* Match 1 */}
            <div className="relative">
              <div className="rounded-xl border border-purple-500/30 bg-[#0b0b2b]/95 p-3 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Match #1</span>
                  <span className="text-green-400 font-bold uppercase">Final</span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('qf1-semi1', 'semi-1', 'Team Aurora', setSemi1Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf1Winner === 'Team Aurora' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Team Aurora</span>
                    <span className="font-mono text-cyan-300">2</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('qf1-semi1', 'semi-1', 'Nebula X', setSemi1Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf1Winner === 'Nebula X' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Nebula X</span>
                    <span className="font-mono text-[#a5b4fc]">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match 2 */}
            <div className="relative">
              <div className="rounded-xl border border-purple-500/30 bg-[#0b0b2b]/95 p-3 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Match #2</span>
                  <span className="text-green-400 font-bold uppercase">Final</span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('qf2-semi1', 'semi-1', 'Cyber Wolves', setSemi1Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf2Winner === 'Cyber Wolves' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Cyber Wolves</span>
                    <span className="font-mono text-cyan-300">2</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('qf2-semi1', 'semi-1', 'Iron Titan', setSemi1Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf2Winner === 'Iron Titan' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Iron Titan</span>
                    <span className="font-mono text-[#a5b4fc]">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match 3 (LIVE MATCH) */}
            <div className="relative">
              <div className="rounded-xl border border-cyan-400/50 bg-[#0b0b2b]/95 p-3 shadow-[0_0_16px_rgba(34,211,238,0.25)]">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Match #3</span>
                  {/* LIVE DOT PULSE: Opacity animation only */}
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[9px] bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 live-dot-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('qf3-semi2', 'semi-2', 'Plus Ultra', setSemi2Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf3Winner === 'Plus Ultra' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Plus Ultra</span>
                    <span className="font-mono text-rose-400 font-black">1</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('qf3-semi2', 'semi-2', 'Valkyrie Core', setSemi2Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf3Winner === 'Valkyrie Core' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Valkyrie Core</span>
                    <span className="font-mono text-cyan-300 font-black">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match 4 */}
            <div className="relative">
              <div className="rounded-xl border border-purple-500/30 bg-[#0b0b2b]/95 p-3 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Match #4</span>
                  <span className="text-purple-300 font-bold uppercase">Scheduled</span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('qf4-semi2', 'semi-2', 'Shadow Strikers', setSemi2Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf4Winner === 'Shadow Strikers' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Shadow Strikers</span>
                    <span className="font-mono text-cyan-300">2</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('qf4-semi2', 'semi-2', 'Apex Raiders', setSemi2Winner)}
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      qf4Winner === 'Apex Raiders' 
                        ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]' 
                        : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                    }`}
                  >
                    <span>Apex Raiders</span>
                    <span className="font-mono text-[#a5b4fc]">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROUND 2: SEMIFINALS */}
        <div className="snap-center shrink-0 w-[280px] sm:w-[300px] lg:w-auto space-y-4 lg:pt-14">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Semifinals
            </span>
            <span className="text-[10px] font-mono text-[#a5b4fc]">Round 2</span>
          </div>

          <div className="space-y-16">
            {/* Semifinal 1 */}
            <div className="relative">
              {/* SVG Connecting Line Drawing with stroke-dashoffset */}
              <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-12 pointer-events-none">
                <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                  <path 
                    d="M 0 0 L 12 24 L 24 24" 
                    stroke={animatedLines['qf1-semi1'] ? '#22d3ee' : '#a855f7'} 
                    strokeWidth="1.5"
                    strokeDasharray="60"
                    strokeDashoffset={animatedLines['qf1-semi1'] ? '0' : '60'}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
              </div>

              <div className={`rounded-xl border border-purple-500/40 bg-[#0b0b2b]/95 p-3.5 shadow-xl transition-all duration-500 ${
                glowingCards['semi-1'] ? 'winner-card-glow' : ''
              }`}>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Semi #1</span>
                  {/* LIVE DOT PULSE */}
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[9px] bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                    <span className="w-2 h-2 rounded-full bg-rose-500 live-dot-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('semi1-final', 'grand-final', semi1Winner, setChampion)}
                    className={`p-2.5 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      semi1Winner ? 'bg-gradient-to-r from-purple-900/70 to-blue-900/70 border border-cyan-400 text-white' : 'bg-white/5 text-[#a5b4fc]'
                    }`}
                  >
                    <span>{semi1Winner}</span>
                    <span className="font-mono text-cyan-300">2</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('semi1-final', 'grand-final', qf2Winner, setChampion)}
                    className="p-2.5 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer bg-white/5 text-[#a5b4fc] hover:bg-white/10"
                  >
                    <span>{qf2Winner}</span>
                    <span className="font-mono text-[#a5b4fc]">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Semifinal 2 */}
            <div className="relative">
              <div className={`rounded-xl border border-purple-500/40 bg-[#0b0b2b]/95 p-3.5 shadow-xl transition-all duration-500 ${
                glowingCards['semi-2'] ? 'winner-card-glow' : ''
              }`}>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a5b4fc] mb-2 pb-1.5 border-b border-purple-500/20">
                  <span>Semi #2</span>
                  <span className="text-cyan-300 font-bold uppercase">Upcoming</span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => triggerAdvance('semi2-final', 'grand-final', semi2Winner, setChampion)}
                    className={`p-2.5 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer transition-all ${
                      semi2Winner ? 'bg-gradient-to-r from-purple-900/70 to-blue-900/70 border border-cyan-400 text-white' : 'bg-white/5 text-[#a5b4fc]'
                    }`}
                  >
                    <span>{semi2Winner}</span>
                    <span className="font-mono text-cyan-300">--</span>
                  </div>
                  <div 
                    onClick={() => triggerAdvance('semi2-final', 'grand-final', qf4Winner, setChampion)}
                    className="p-2.5 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer bg-white/5 text-[#a5b4fc] hover:bg-white/10"
                  >
                    <span>{qf4Winner}</span>
                    <span className="font-mono text-[#a5b4fc]">--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROUND 3: GRAND FINALS */}
        <div className="snap-center shrink-0 w-[280px] sm:w-[300px] lg:w-auto space-y-4 lg:pt-36">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
              <Trophy size={14} className="text-yellow-400" /> Grand Finals
            </span>
            <span className="text-[10px] font-mono text-[#a5b4fc]">Championship</span>
          </div>

          <div className="relative">
            {/* SVG Connecting Line Drawing with stroke-dashoffset */}
            <div className="hidden lg:block absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-20 pointer-events-none">
              <svg width="32" height="60" viewBox="0 0 32 60" fill="none">
                <path 
                  d="M 0 10 L 16 30 L 32 30 M 0 50 L 16 30" 
                  stroke={animatedLines['semi1-final'] ? '#22d3ee' : '#a855f7'} 
                  strokeWidth="1.5"
                  strokeDasharray="90"
                  strokeDashoffset={animatedLines['semi1-final'] ? '0' : '90'}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
            </div>

            <div className={`rounded-2xl border-2 border-yellow-400/50 bg-[#0b0b2b]/95 p-4 shadow-[0_0_30px_rgba(250,204,21,0.25)] transition-all duration-500 ${
              glowingCards['grand-final'] ? 'winner-card-glow' : ''
            }`}>
              <div className="flex justify-between items-center text-[10px] font-mono text-yellow-300 mb-2.5 pb-1.5 border-b border-yellow-500/25">
                <span className="font-black">BO5 TITLE FIGHT</span>
                <span className="px-2 py-0.5 rounded-md bg-yellow-950 text-yellow-300 border border-yellow-500/40 font-bold">5,000 M3GA</span>
              </div>
              <div className="space-y-2">
                <div 
                  onClick={() => triggerAdvance('final-champ', 'champ-node', semi1Winner, setChampion)}
                  className={`p-3 rounded-xl text-xs font-black flex justify-between items-center cursor-pointer transition-all ${
                    champion === semi1Winner 
                      ? 'bg-gradient-to-r from-yellow-500/20 via-purple-600/50 to-blue-600/50 border border-yellow-400 text-white shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
                      : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{semi1Winner}</span>
                  </div>
                  <span className="font-mono text-yellow-300 text-sm">3</span>
                </div>
                <div 
                  onClick={() => triggerAdvance('final-champ', 'champ-node', semi2Winner, setChampion)}
                  className={`p-3 rounded-xl text-xs font-black flex justify-between items-center cursor-pointer transition-all ${
                    champion === semi2Winner 
                      ? 'bg-gradient-to-r from-yellow-500/20 via-purple-600/50 to-blue-600/50 border border-yellow-400 text-white shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
                      : 'bg-white/5 text-[#a5b4fc] hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{semi2Winner}</span>
                  </div>
                  <span className="font-mono text-[#a5b4fc] text-sm">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHAMPIONSHIP NODE */}
        <div className="snap-center shrink-0 w-[260px] sm:w-[280px] lg:w-auto space-y-4 lg:pt-40">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" /> Crowned Victor
            </span>
          </div>

          <div className={`p-5 rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#2a1b05] via-[#120e26] to-[#07051a] shadow-[0_0_35px_rgba(234,179,8,0.45)] text-center space-y-3 transition-all duration-500 ${
            glowingCards['champ-node'] ? 'winner-card-glow' : ''
          }`}>
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.6)]">
              <Trophy size={28} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300/80 block">Grand Champion</span>
              <h4 className="font-heading text-lg sm:text-xl text-white uppercase tracking-tight text-glow-purple">
                {champion}
              </h4>
            </div>
            <div className="pt-2 border-t border-yellow-500/20 flex items-center justify-center gap-1.5 text-[11px] font-mono text-cyan-300 font-bold">
              <span>Prize Awarded:</span>
              <span className="text-yellow-300 font-black">5,000 M3GA</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TournamentBracketView;
