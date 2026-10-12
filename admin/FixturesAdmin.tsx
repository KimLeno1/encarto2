import React, { useState } from 'react';
import { Swords, Clock, Edit3, CheckCircle2, Search, Filter } from 'lucide-react';
import { MATCH_FIXTURES } from '../mockData.ts';

const FixturesAdmin: React.FC = () => {
  const [fixtures, setFixtures] = useState(MATCH_FIXTURES);

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Swords size={20} className="text-red-500" /> Scoreboard Control
        </h3>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[8px] font-black uppercase tracking-widest animate-pulse">2 LIVE SESSIONS</div>
        </div>
      </header>

      <div className="grid gap-6">
        {fixtures.map(f => (
          <div key={f.id} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8 group hover:border-red-600/20 transition-all">
            <div className="flex justify-between items-start">
               <div>
                 <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{f.tournamentName}</span>
                 <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">FIXTURE ID: {f.id}</p>
               </div>
               <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${f.status === 'live' ? 'bg-red-600/20 text-red-500' : 'bg-blue-600/20 text-blue-500'}`}>{f.status}</span>
            </div>

            <div className="flex items-center justify-between gap-8 max-w-2xl mx-auto w-full">
              <div className="flex-1 text-center space-y-3">
                 <p className="text-lg font-black text-white uppercase truncate">{f.teamA}</p>
                 <input type="number" defaultValue={0} className="w-16 bg-white/5 border border-white/10 rounded-xl py-3 text-center text-xl font-black text-white focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div className="p-3 bg-white/5 rounded-full text-gray-700 italic text-xs font-black">VS</div>
              <div className="flex-1 text-center space-y-3">
                 <p className="text-lg font-black text-white uppercase truncate">{f.teamB}</p>
                 <input type="number" defaultValue={0} className="w-16 bg-white/5 border border-white/10 rounded-xl py-3 text-center text-xl font-black text-white focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase">
                   <Clock size={12}/> {f.time}
                 </div>
               </div>
               <div className="flex gap-3">
                 <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">End Match</button>
                 <button className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 flex items-center gap-2">
                   <CheckCircle2 size={16} /> Sync Scores
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixturesAdmin;
