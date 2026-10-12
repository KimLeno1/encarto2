import React from 'react';
import { Radio, Plus, Image as ImageIcon, Link2, Eye, ShieldCheck, ToggleRight } from 'lucide-react';

const AdsAdmin: React.FC = () => {
  const ads = [
    { title: 'Encarto Elite Hoodie', spot: 'Blog Feed', status: 'ACTIVE', clicks: 428 },
    { title: 'Golden Aura Discount', spot: 'Store Hero', status: 'DRAFT', clicks: 0 },
    { title: 'Grand Line Open Registration', spot: 'Global Pulse', status: 'ACTIVE', clicks: 1205 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Radio size={20} className="text-orange-500" /> Propaganda Engine
        </h3>
        <button className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
          <Plus size={16} /> Deploy Campaign
        </button>
      </header>

      <div className="grid gap-6">
        {ads.map((ad, i) => (
          <div key={i} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-red-600/20 transition-all">
             <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10">
                   <ImageIcon size={24}/>
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ad.status === 'ACTIVE' ? 'bg-green-600/20 text-green-500' : 'bg-gray-600/20 text-gray-500'}`}>{ad.status}</span>
                     <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{ad.spot}</span>
                   </div>
                   <h4 className="text-xl font-black text-white uppercase">{ad.title}</h4>
                   <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Eye size={12}/> {ad.clicks} ENGAGEMENTS</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors border border-white/5"><Link2 size={18}/></button>
                <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors border border-white/5"><ToggleRight size={18}/></button>
                <button className="px-8 py-3 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-600/20 hover:bg-red-600 hover:text-white transition-all">Decommission</button>
             </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
         <div className="flex items-center gap-3 text-blue-500">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Platform Integrity Clause</span>
         </div>
         <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">System Admin notice: All advertisements must undergo biometric validation through the Gemini engine before being transmitted to the global feed.</p>
      </div>
    </div>
  );
};

export default AdsAdmin;
