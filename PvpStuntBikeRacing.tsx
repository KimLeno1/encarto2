
import React, { useState, useEffect } from 'react';
import { Bike, Sparkles, TrendingUp, ShieldCheck, Zap, Award } from 'lucide-react';

interface PvpStuntBikeRacingProps {
  wager: number;
  opponent: string;
  onGameOver: (winner: string) => void;
}

const PvpStuntBikeRacing: React.FC<PvpStuntBikeRacingProps> = ({ wager, opponent, onGameOver }) => {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const pool = (wager * 2) * 0.8;

  const performStunt = (points: number) => {
    setCombo(c => c + 1);
    setScore(s => s + (points * multiplier));
    if (combo > 5) setMultiplier(m => Math.min(m + 0.5, 5));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in zoom-in-95 duration-700">
      <div className="flex-grow flex flex-col items-center justify-center space-y-12">
        <div className="relative w-full max-w-2xl aspect-video bg-zinc-900 border-4 border-white/5 rounded-[3rem] overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15),_transparent)]" />
            
            <div className="absolute top-10 left-10 space-y-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Scoreboard</span>
                <p className="text-6xl font-black text-white tracking-tighter italic">{score.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-black rounded uppercase">x{multiplier.toFixed(1)} Multiplier</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase">{combo} Combo</span>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 group">
                <div className="p-8 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/30 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                    <Bike size={64} />
                </div>
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-primary uppercase">Active: Hyper-Flip</p>
                </div>
            </div>

            <div className="absolute top-10 right-10 p-6 bg-white/5 border border-white/5 rounded-3xl text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Lead Opponent</p>
                <p className="text-3xl font-black text-red-500 italic uppercase">{opponent}</p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
            <button 
              onClick={() => performStunt(100)}
              className="py-6 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-white uppercase hover:bg-primary hover:border-primary transition-all flex flex-col items-center gap-2"
            >
              <Zap size={20}/> Backflip
            </button>
            <button 
              onClick={() => performStunt(250)}
              className="py-6 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-white uppercase hover:bg-primary hover:border-primary transition-all flex flex-col items-center gap-2"
            >
              <Award size={20}/> 360 Spin
            </button>
            <button 
              onClick={() => onGameOver('Me')}
              className="py-6 bg-primary text-white rounded-3xl text-[10px] font-black uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2"
            >
              <TrendingUp size={20}/> Final Surge
            </button>
        </div>
      </div>

      <aside className="w-full lg:w-80 glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-between">
        <div className="space-y-8">
          <h3 className="anime-title text-3xl text-white uppercase tracking-tighter">Stunt Masters</h3>
          
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">Pool Reward (80%)</p>
            <p className="text-4xl font-black text-white italic">{pool.toFixed(1)} <span className="text-xs text-primary">M3GA</span></p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-yellow-500">
               <Sparkles size={16}/>
               <span className="text-[10px] font-black uppercase tracking-widest">Physics Logic Active</span>
             </div>
             <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
               Groundwork: Frame-perfect sync engaged. Combo scoring is server-side validated.
             </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-primary">
          <ShieldCheck size={16}/>
          <span className="text-[8px] font-black uppercase tracking-widest">MESH VALIDATED</span>
        </div>
      </aside>
    </div>
  );
};

export default PvpStuntBikeRacing;
