
import React, { useState } from 'react';
import { Search, ArrowDownUp } from 'lucide-react';
import { Trophy, Star, Crown, Medal } from 'lucide-react';
import { HallOfFameEntry } from './types';
import { MOCK_HALL_OF_FAME } from './mockData';

const HallOfFamePanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rank'>('recent');
  const entries = MOCK_HALL_OF_FAME
    .filter(entry => `${entry.winnerName} ${entry.tournamentName}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .sort((a, b) => sortBy === 'rank' ? b.rankAtWin - a.rankAtWin : b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700 pb-24 relative">
      {/* Bold All Might Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1601850494422-3cf14624b0bb?auto=format&fit=crop&q=80&w=1200" 
          alt="All Might Presence" 
          className="w-full h-full object-cover grayscale brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 space-y-16 py-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-500/20 rounded-full mb-4 border border-yellow-500/30 animate-pulse">
            <Crown size={48} className="text-yellow-500" />
          </div>
          <h2 className="anime-title text-7xl md:text-8xl text-white uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]">
            Hall of Souls
          </h2>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.5em]">Where Legends Are Written in Neon</p>
        </header>

        <section className="mx-4 grid gap-4 rounded-3xl border border-violet-300/15 bg-[#0c0c1c]/80 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Search size={17} className="text-violet-200" />
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search champions or tournaments..." aria-label="Search Hall of Fame" className="w-full border-0 bg-transparent text-sm outline-none focus:ring-0" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs font-bold text-slate-300">
            <ArrowDownUp size={15} className="text-sky-200" />
            <span>Sort</span>
            <select value={sortBy} onChange={event => setSortBy(event.target.value as 'recent' | 'rank')} aria-label="Sort Hall of Fame" className="border-0 bg-transparent text-sm outline-none focus:ring-0">
              <option value="recent">Most recent</option><option value="rank">Highest rank</option>
            </select>
          </label>
        </section>
        {entries.length === 0 ? <div className="mx-4 rounded-3xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-400">No legends match that search. Try a champion name or tournament title.</div> : null}
        <div className="grid lg:grid-cols-2 gap-8 px-4">
          {entries.map((entry, idx) => (
            <div 
              key={`${entry.winnerName}-${entry.tournamentName}`} 
              className={`glass-panel rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden group hover:scale-[1.02] ${
                idx === 0 
                  ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-black/60 to-black/60 shadow-[0_0_40px_rgba(250,204,21,0.15)]' 
                  : 'border-white/5 bg-black/40 hover:border-primary/40'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-8 flex items-center gap-8">
                <div className="relative flex-shrink-0">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black rotate-3 group-hover:rotate-0 transition-transform duration-500 ${
                    idx === 0 ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-primary/20 text-primary border border-primary/20'
                  }`}>
                    {entry.winnerName.charAt(0)}
                  </div>
                  {idx === 0 && (
                    <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-2 rounded-xl shadow-xl animate-bounce">
                      <Trophy size={16} />
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-2xl font-black uppercase tracking-tight ${idx === 0 ? 'text-yellow-500' : 'text-white'}`}>
                        {entry.winnerName}
                      </h4>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Medal size={12} className={idx === 0 ? 'text-yellow-500' : 'text-primary'} /> Rank {entry.rankAtWin} Veteran
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">#{idx + 1} LATEST</span>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Crowned at</p>
                    <p className="text-lg font-black text-white uppercase leading-none">{entry.tournamentName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-bold text-gray-600 uppercase">{entry.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[8px] font-bold text-primary uppercase">VICTORY SECURED</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block opacity-0 group-hover:opacity-10 transition-opacity absolute right-10 top-1/2 -translate-y-1/2">
                   <Star size={120} className="text-white fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Banner */}
        <div className="px-4">
          <div className="glass-panel p-12 rounded-[3.5rem] border border-white/10 bg-gradient-to-r from-primary/10 via-black to-black flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">"Plus Ultra! Go beyond!"</h3>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                The Hall of Souls only has room for 10 legends. Every new champion pushes the history of the arena further. Will you be the one to claim the top spot?
              </p>
            </div>
            <div className="relative group">
               <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <img 
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=AllMight" 
                 alt="Legendary" 
                 className="w-32 h-32 rounded-full border-4 border-primary relative z-10 group-hover:scale-110 transition-transform duration-500" 
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFamePanel;
