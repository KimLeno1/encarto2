
import React, { useState, useEffect } from 'react';
import { Flag, Gauge, Zap, ShieldCheck, Activity, FastForward } from 'lucide-react';

interface PvpCarRacingProps {
  wager: number;
  opponent: string;
  onGameOver: (winner: string) => void;
}

const PvpCarRacing: React.FC<PvpCarRacingProps> = ({ wager, opponent, onGameOver }) => {
  const [myProgress, setMyProgress] = useState(0);
  const [oppProgress, setOppProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boosts, setBoosts] = useState(3);
  const [isRacing, setIsRacing] = useState(false);
  const pool = (wager * 2) * 0.8;

  useEffect(() => {
    if (!isRacing) return;

    const race = setInterval(() => {
      setMyProgress(p => {
        const next = p + (speed / 100) + (Math.random() * 0.5);
        if (next >= 100) {
          clearInterval(race);
          onGameOver('Me');
          return 100;
        }
        return next;
      });

      // Groundwork: In production, this value comes from the server's state relay
      setOppProgress(p => {
        const next = p + 0.8 + (Math.random() * 0.6);
        return next >= 100 ? 100 : next;
      });

      setSpeed(s => Math.max(120, s + (Math.random() * 5 - 2)));
    }, 100);

    return () => clearInterval(race);
  }, [isRacing, speed, opponent, onGameOver]);

  const handleBoost = () => {
    if (boosts <= 0 || !isRacing) return;
    setBoosts(b => b - 1);
    setSpeed(s => s + 50);
    setTimeout(() => setSpeed(s => s - 40), 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex-grow flex flex-col justify-center space-y-12">
        <div className="space-y-12 px-12">
          {/* My Track */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded">Player A (You)</span>
                <h4 className="text-xl font-black text-white mt-1 uppercase">Speedster-X</h4>
              </div>
              <span className="text-3xl font-black text-white italic">{Math.floor(myProgress)}% <span className="text-[10px] text-gray-500">DIST</span></span>
            </div>
            <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_25px_var(--primary)] transition-all duration-150 ease-linear flex items-center justify-end px-2" 
                style={{ width: `${myProgress}%` }}
              >
                <Zap size={14} className="text-white fill-current animate-pulse" />
              </div>
            </div>
          </div>

          {/* Opponent Track */}
          <div className="space-y-4 opacity-40 grayscale-[0.5] transition-all hover:opacity-70">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-red-500 uppercase bg-red-500/10 px-3 py-1 rounded">Player B ({opponent})</span>
                <h4 className="text-xl font-black text-white mt-1 uppercase">Night-Rider</h4>
              </div>
              <span className="text-3xl font-black text-white italic">{Math.floor(oppProgress)}%</span>
            </div>
            <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              <div 
                className="h-full bg-red-600 rounded-full shadow-[0_0_25px_#dc2626] transition-all duration-150 ease-linear" 
                style={{ width: `${oppProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8">
            <button 
              onClick={() => setIsRacing(true)}
              disabled={isRacing}
              className={`p-10 rounded-full border-4 flex flex-col items-center justify-center transition-all ${isRacing ? 'border-primary bg-primary/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <Gauge size={40} className={isRacing ? 'text-primary animate-pulse' : 'text-gray-700'} />
              <span className="text-[10px] font-black mt-2 uppercase">{isRacing ? `${Math.floor(speed)} KM/H` : 'Ignition'}</span>
            </button>

            <button 
              onClick={handleBoost}
              disabled={!isRacing || boosts === 0}
              className={`px-12 rounded-3xl border-4 flex flex-col items-center justify-center transition-all ${boosts > 0 && isRacing ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-xl shadow-orange-500/20' : 'border-white/10 text-gray-800'}`}
            >
              <FastForward size={32} />
              <span className="text-[10px] font-black mt-1 uppercase">Nitro ({boosts})</span>
            </button>
        </div>
      </div>

      <aside className="w-full lg:w-80 glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-between">
        <div className="space-y-8">
          <h3 className="anime-title text-3xl text-white uppercase tracking-tighter">Velocity Arena</h3>
          
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-gray-600 uppercase mb-2">Potential Earnings</p>
            <p className="text-4xl font-black text-white italic">{pool.toFixed(1)} <span className="text-xs text-primary">M3GA</span></p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-primary">
               <Activity size={16} className="animate-pulse" />
               <span className="text-[10px] font-black uppercase">Real-Time Telemetry</span>
             </div>
             <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
               Groundwork: Latency correction active. Sub-10ms drift detected. Position synced to Encarto-V3 Relay.
             </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ShieldCheck size={16}/>
            <span className="text-[8px] font-black uppercase tracking-widest">SESSION SECURED</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PvpCarRacing;
