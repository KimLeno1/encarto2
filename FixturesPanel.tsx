
import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, Swords, Trophy, Users, Star, Info, ChevronRight, Filter } from 'lucide-react';
import { Fixture, PlayerProfile } from './types';

interface FixturesPanelProps {
  fixtures: Fixture[];
  profile: PlayerProfile;
}

const FixturesPanel: React.FC<FixturesPanelProps> = ({ fixtures, profile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Fixture['status']>('all');

  const sortedFixtures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...fixtures]
      .filter(f => !query || `${f.tournamentName} ${f.teamA} ${f.teamB} ${f.game}`.toLowerCase().includes(query))
      .filter(f => statusFilter === 'all' || f.status === statusFilter)
      .sort((a, b) => {
        const aIsMyMatch = a.participants.includes(profile.name);
        const bIsMyMatch = b.participants.includes(profile.name);
        if (aIsMyMatch !== bIsMyMatch) return aIsMyMatch ? -1 : 1;
        const dateOrder = a.date.localeCompare(b.date);
        return dateOrder || a.time.localeCompare(b.time);
      });
  }, [fixtures, searchQuery, statusFilter, profile.name]);

  const myMatches = sortedFixtures.filter(f => f.participants.includes(profile.name));
  const otherMatches = sortedFixtures.filter(f => !f.participants.includes(profile.name));

  const FixtureCard = ({ fixture, highlight = false }: { fixture: Fixture; highlight?: boolean; key?: any }) => (
    <div className={`glass-panel rounded-[2.5rem] border transition-all duration-300 relative group overflow-hidden ${
      highlight 
        ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-black/40 to-black/40 shadow-2xl shadow-primary/10' 
        : 'border-white/5 hover:border-white/20'
    }`}>
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
      )}
      <div className="p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
              {fixture.game}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
              fixture.status === 'live' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {fixture.status}
            </span>
          </div>
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{fixture.id}</span>
        </header>

        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">{fixture.tournamentName}</p>
          <div className="flex items-center justify-between w-full max-w-md gap-8">
            <div className="flex-1 flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all ${fixture.teamA === profile.name ? 'bg-primary text-white shadow-lg shadow-primary/30 border-2 border-primary/40' : 'bg-white/5 text-gray-400 border border-white/5'}`}>
                {fixture.teamA.charAt(0)}
              </div>
              <p className={`text-sm font-black uppercase tracking-tight ${fixture.teamA === profile.name ? 'text-primary' : 'text-white'}`}>{fixture.teamA}</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-white/5 rounded-full text-gray-600">
                <Swords size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic">VS</span>
            </div>

            <div className="flex-1 flex flex-col items-center text-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all ${fixture.teamB === profile.name ? 'bg-primary text-white shadow-lg shadow-primary/30 border-2 border-primary/40' : 'bg-white/5 text-gray-400 border border-white/5'}`}>
                {fixture.teamB.charAt(0)}
              </div>
              <p className={`text-sm font-black uppercase tracking-tight ${fixture.teamB === profile.name ? 'text-primary' : 'text-white'}`}>{fixture.teamB}</p>
            </div>
          </div>
        </div>

        <footer className="pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{fixture.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{fixture.time}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
            View Stats <ChevronRight size={12} />
          </button>
        </footer>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="anime-title text-6xl text-white uppercase tracking-tight">The Arena Slate</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            Confirmed battle schedules for the current season
          </p>
        </div>
        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Tournament Fixtures..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'scheduled', 'live', 'finished'] as const).map(status => (
          <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${statusFilter === status ? 'border-primary/50 bg-primary/15 text-primary' : 'border-white/10 bg-white/[.025] text-gray-500 hover:text-white'}`}>
            {status === 'all' ? 'All fixtures' : status}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-600">{sortedFixtures.length} match{sortedFixtures.length === 1 ? '' : 'es'} found</span>
      </div>

      {/* Hero Section for User Matches */}
      {myMatches.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Star size={20} className="fill-current" />
            </div>
            <h3 className="anime-title text-3xl text-white uppercase tracking-tight">Your Deployments</h3>
            <span className="px-3 py-1 bg-primary text-white text-[8px] font-black rounded uppercase tracking-widest">Priority Intel</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {myMatches.map(f => (
              <FixtureCard key={f.id} fixture={f} highlight />
            ))}
          </div>
        </section>
      )}

      {/* Secondary Section for All Matches */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-lg text-gray-500">
              <Filter size={20} />
            </div>
            <h3 className="anime-title text-3xl text-white uppercase tracking-tight">Global Fixtures</h3>
          </div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Showing {otherMatches.length} Matches</span>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherMatches.map(f => (
            <FixtureCard key={f.id} fixture={f} />
          ))}
        </div>

        {sortedFixtures.length === 0 && (
          <div className="py-32 text-center glass-panel rounded-[3rem] border-dashed border-white/10">
            <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info size={40} className="text-gray-800" />
            </div>
            <p className="text-gray-600 font-black uppercase text-xs tracking-[0.4em]">No battle reports found matching your criteria</p>
          </div>
        )}
      </section>

      {/* Ad Break */}
      <div className="glass-panel p-10 rounded-[3rem] border border-primary/20 bg-gradient-to-r from-primary/10 via-black to-black flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="space-y-4">
          <h4 className="text-2xl font-black text-white uppercase tracking-tight">Upgrade To Encarto Premium</h4>
          <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-lg">Get real-time frame data, opponent replay analysis, and priority queue for all tournament fixtures.</p>
        </div>
        <button className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">Go Pro Now</button>
      </div>
    </div>
  );
};

export default FixturesPanel;
