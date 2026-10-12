import React from 'react';
import { Gamepad2, Plus, Edit3, Trash2, ShieldCheck, Globe } from 'lucide-react';

const GamesAdmin: React.FC = () => {
  const games = [
    { name: 'MHA: Ultra Rumble', type: 'Battle Royale', status: 'ONLINE', sessions: 421 },
    { name: 'One Piece Clash', type: 'Fighting', status: 'ONLINE', sessions: 156 },
    { name: 'Shinobi Striker', type: 'Arena Fighter', status: 'MAINTENANCE', sessions: 0 },
    { name: 'PvP Chess', type: 'Strategy', status: 'ONLINE', sessions: 2891 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Gamepad2 size={20} className="text-blue-500" /> Ecosystem Engines
        </h3>
        <button className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-red-600/20">
          <Plus size={16} /> Integrate New Engine
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {games.map((g, i) => (
          <div key={i} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-red-600/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
               <div className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${g.status === 'ONLINE' ? 'bg-green-600/20 text-green-500' : 'bg-yellow-600/20 text-yellow-500'}`}>{g.status}</div>
               <div className="flex gap-2">
                 <button className="text-gray-600 hover:text-white"><Edit3 size={16}/></button>
                 <button className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
               </div>
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tight">{g.name}</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{g.type}</p>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase">
                  <Globe size={14}/> {g.sessions} Active Instances
               </div>
               <button className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">Shutdown</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesAdmin;
