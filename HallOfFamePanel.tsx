import React, { useState } from 'react';
import { Search, ArrowDownUp, Trophy, Star, Crown, Medal, Award, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { HallOfFameEntry } from './types.ts';
import { MOCK_HALL_OF_FAME } from './mockData.ts';

export const HallOfFamePanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rank'>('recent');

  const entries = MOCK_HALL_OF_FAME
    .filter(entry => `${entry.winnerName} ${entry.tournamentName}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .sort((a, b) => sortBy === 'rank' ? b.rankAtWin - a.rankAtWin : b.date.localeCompare(a.date));

  const top3 = entries.slice(0, 3);
  const remainingLegends = entries.slice(3);

  const champion1st = top3[0]; // Center
  const champion2nd = top3[1]; // Left
  const champion3rd = top3[2]; // Right

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-28 animate-in fade-in duration-300 px-1 sm:px-2">
      {/* Header */}
      <div className="cyber-card p-6 sm:p-8 rounded-[24px] text-center relative overflow-hidden">
        <div className="inline-flex items-center justify-center p-3.5 bg-yellow-500/10 rounded-full mb-3 border border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.35)]">
          <Crown size={32} className="text-yellow-400" />
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl text-white uppercase tracking-tight">
          HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">FAME</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#a5b4fc] font-medium uppercase tracking-[0.3em] mt-2 max-w-xl mx-auto">
          Where Champions Are Immortalized in Neon
        </p>

        {/* Search & Sort Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search legendary champions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07051a]/90 border border-purple-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-purple-400/50 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#07051a]/90 border border-purple-500/30 rounded-xl p-1 shrink-0 w-full sm:w-auto justify-center">
            <span className="text-[10px] font-bold text-[#a5b4fc] pl-2 uppercase">Sort:</span>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                sortBy === 'recent' ? 'bg-purple-600 text-white shadow-sm' : 'text-[#a5b4fc] hover:text-white'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('rank')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                sortBy === 'rank' ? 'bg-yellow-500 text-black shadow-sm font-black' : 'text-[#a5b4fc] hover:text-white'
              }`}
            >
              Rank
            </button>
          </div>
        </div>
      </div>

      {/* TOP 3 STYLIZED PODIUM (Gold, Silver, Bronze Neon Glow) */}
      {top3.length >= 3 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" /> Grand Championship Podium
            </span>
            <span className="text-[10px] font-mono text-[#a5b4fc]">Top 3 Legends</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-8">
            
            {/* 2ND PLACE - SILVER PODIUM (Left) */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              {/* Champion Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 shadow-[0_0_12px_rgba(148,163,184,0.5)]">
                  #2 SILVER
                </span>
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-700 p-0.5 shadow-[0_0_20px_rgba(148,163,184,0.5)]">
                  <div className="w-full h-full rounded-2xl bg-[#0b0b2b] flex items-center justify-center text-2xl font-black text-slate-200">
                    {champion2nd.winnerName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Pedestal Block */}
              <div className="w-full podium-silver-glow rounded-2xl bg-[#0b0b2b]/95 p-5 text-center flex flex-col justify-between h-48 sm:h-56">
                <div>
                  <h3 className="font-heading text-lg sm:text-xl text-white uppercase tracking-tight truncate">
                    {champion2nd.winnerName}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1 mt-0.5">
                    <Medal size={12} className="text-slate-300" /> Rank {champion2nd.rankAtWin} Master
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-500/20">
                  <span className="text-[9px] font-black uppercase text-[#a5b4fc] block">Tournament Title</span>
                  <p className="text-xs font-bold text-white uppercase truncate mt-0.5">{champion2nd.tournamentName}</p>
                  <span className="text-[10px] font-mono text-slate-300 mt-1 block">{champion2nd.date}</span>
                </div>
              </div>
            </div>

            {/* 1ST PLACE - GOLD PODIUM (Center - Tallest) */}
            <div className="order-1 md:order-2 flex flex-col items-center -mt-6">
              {/* Champion Avatar with Floating Crown */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="animate-bounce mb-1">
                  <Crown size={28} className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-500 text-black font-black text-[11px] uppercase tracking-wider mb-2 shadow-[0_0_18px_rgba(250,204,21,0.7)]">
                  #1 CHAMPION
                </span>
                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-1 shadow-[0_0_35px_rgba(250,204,21,0.7)]">
                  <div className="w-full h-full rounded-2xl bg-[#07051a] flex items-center justify-center text-3xl font-black text-yellow-300">
                    {champion1st.winnerName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Pedestal Block (Highest) */}
              <div className="w-full podium-gold-glow rounded-2xl bg-gradient-to-b from-[#1c1404] via-[#0b0b2b] to-[#07051a] p-6 text-center flex flex-col justify-between h-56 sm:h-64">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-yellow-300 uppercase tracking-tight truncate drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                    {champion1st.winnerName}
                  </h3>
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center justify-center gap-1 mt-1">
                    <Trophy size={14} className="text-yellow-400" /> Apex Legend • Rank {champion1st.rankAtWin}
                  </p>
                </div>

                <div className="pt-3 border-t border-yellow-500/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a5b4fc] block">Crowned Champion</span>
                  <p className="text-sm font-heading text-white uppercase truncate mt-0.5">{champion1st.tournamentName}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-cyan-300">{champion1st.date}</span>
                    <span className="w-1 h-1 rounded-full bg-yellow-400" />
                    <span className="text-[9px] font-bold text-yellow-300 uppercase">UNCONQUERED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3RD PLACE - BRONZE PODIUM (Right) */}
            <div className="order-3 flex flex-col items-center">
              {/* Champion Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 text-[10px] font-black uppercase tracking-wider mb-2 shadow-[0_0_12px_rgba(217,119,6,0.5)]">
                  #3 BRONZE
                </span>
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 p-0.5 shadow-[0_0_20px_rgba(217,119,6,0.5)]">
                  <div className="w-full h-full rounded-2xl bg-[#0b0b2b] flex items-center justify-center text-2xl font-black text-amber-300">
                    {champion3rd.winnerName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Pedestal Block */}
              <div className="w-full podium-bronze-glow rounded-2xl bg-[#0b0b2b]/95 p-5 text-center flex flex-col justify-between h-44 sm:h-52">
                <div>
                  <h3 className="font-heading text-lg sm:text-xl text-white uppercase tracking-tight truncate">
                    {champion3rd.winnerName}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                    <Medal size={12} className="text-amber-400" /> Rank {champion3rd.rankAtWin} Veteran
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-500/20">
                  <span className="text-[9px] font-black uppercase text-[#a5b4fc] block">Tournament Title</span>
                  <p className="text-xs font-bold text-white uppercase truncate mt-0.5">{champion3rd.tournamentName}</p>
                  <span className="text-[10px] font-mono text-amber-300 mt-1 block">{champion3rd.date}</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* CLEAN RANKED LIST FOR REMAINING LEGENDS (Rank 4 to 10+) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#a5b4fc] flex items-center gap-1.5">
            <Award size={14} className="text-purple-400" /> Arena Honor Roll (Ranks 4+)
          </span>
          <span className="text-[10px] font-mono text-[#a5b4fc]">
            Showing {remainingLegends.length} Legends
          </span>
        </div>

        <div className="space-y-2.5">
          {remainingLegends.map((entry, index) => {
            const rankNumber = index + 4;
            return (
              <div
                key={`${entry.winnerName}-${entry.tournamentName}`}
                className="p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-purple-500/25 bg-[#0b0b2b]/80 hover:bg-[#120a33]/90 hover:border-purple-400/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <span className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-black flex items-center justify-center shrink-0">
                    #{rankNumber}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-400/30 flex items-center justify-center text-xs font-black text-cyan-300 shrink-0">
                    {entry.winnerName.charAt(0)}
                  </div>

                  <div className="truncate">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors truncate">
                      {entry.winnerName}
                    </h4>
                    <span className="text-[10px] font-mono text-[#a5b4fc]">
                      Rank {entry.rankAtWin} Contender
                    </span>
                  </div>
                </div>

                {/* Crowned Tournament */}
                <div className="flex-1 sm:text-center truncate">
                  <span className="text-[9px] font-black uppercase text-[#a5b4fc] block">Crowned At</span>
                  <span className="text-xs font-bold text-white uppercase truncate block">
                    {entry.tournamentName}
                  </span>
                </div>

                {/* Win Date & Victory Tag */}
                <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[170px] pt-1 sm:pt-0 border-t sm:border-t-0 border-purple-500/15">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-cyan-300 block">{entry.date}</span>
                    <span className="text-[9px] font-black uppercase text-purple-300">Victory Archived</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-950/50 text-[#a5b4fc] group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-purple-500/30 bg-[#0b0b2b]/40">
            <Trophy size={32} className="text-purple-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[#a5b4fc] font-bold uppercase tracking-wider">
              No hall of fame records matching criteria
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HallOfFamePanel;
