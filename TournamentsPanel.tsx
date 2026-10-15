import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  X, 
  Info, 
  Shield, 
  UserPlus, 
  Clock, 
  Search, 
  Zap, 
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
  Swords
} from 'lucide-react';
import { Tournament, Ticket, PlayerProfile } from './types.ts';
import { GlowingPrizePool } from './GlowingPrizePool.tsx';
import { TournamentBracketView } from './TournamentBracketView.tsx';

interface TournamentsPanelProps {
  tournaments: Tournament[];
  onRegister: (t: Tournament) => Ticket | undefined;
  tickets: Ticket[];
  profile: PlayerProfile;
}

export const TournamentsPanel: React.FC<TournamentsPanelProps> = ({ tournaments, onRegister, tickets, profile }) => {
  const [successTicket, setSuccessTicket] = useState<Ticket | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'enrolled'>('all');
  const [activeTab, setActiveTab] = useState<'tournaments' | 'bracket'>('tournaments');

  const handleRegister = (t: Tournament) => {
    const ticket = onRegister(t);
    if (ticket) {
      setSuccessTicket(ticket);
      if (viewingTournament?.id === t.id) {
        setViewingTournament({
          ...t,
          registeredPlayers: [...t.registeredPlayers, profile.name]
        });
      }
    }
  };

  const isRegistered = (tournamentName: string) => {
    return tickets.some(ticket => ticket.tournamentName === tournamentName);
  };

  const query = searchQuery.toLowerCase().trim();
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = !query || t.name.toLowerCase().includes(query) || t.game.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (filterStatus === 'active') return t.status === 'active';
    if (filterStatus === 'upcoming') return t.status === 'upcoming';
    if (filterStatus === 'enrolled') return isRegistered(t.name);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-24 px-1 sm:px-2">
      {/* Access Ticket Modal */}
      {successTicket && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[24px] overflow-hidden border border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.4)] bg-[#07051a] p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-heading text-2xl text-white uppercase tracking-tight">Arena Pass Secured</h3>
              <p className="text-[#a5b4fc] text-xs font-medium mt-1">Your cryptographic match clearance is verified</p>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-inner mx-auto max-w-[220px]">
              <QrCode size={160} className="text-black mx-auto" />
              <p className="mt-3 text-black font-black text-xs tracking-[0.3em] uppercase font-mono">{successTicket.id}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white uppercase">{successTicket.tournamentName}</h4>
              <p className="text-cyan-300 font-mono font-bold text-xs">{successTicket.date}</p>
            </div>

            <button 
              onClick={() => setSuccessTicket(null)}
              className="w-full py-3.5 rounded-xl cyber-btn text-white font-black text-xs uppercase tracking-widest cursor-pointer"
            >
              Confirm & Close
            </button>
          </div>
        </div>
      )}

      {/* Tournament Detail & Full Bracket Modal */}
      {viewingTournament && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-5xl max-h-[92vh] rounded-[24px] overflow-hidden border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.35)] bg-[#07051a] flex flex-col">
            <header className="p-5 sm:p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0 bg-[#0b0b2b]/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">{viewingTournament.name}</h3>
                  <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">{viewingTournament.game}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingTournament(null)} 
                className="p-2 rounded-full bg-[#0b0b2b] hover:bg-purple-900/60 text-[#a5b4fc] hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-8">
              {/* Prize Pool with count-up animation inside modal */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <GlowingPrizePool 
                  amount={viewingTournament.entryFee * 100 || 5000} 
                  label="Verified Match Bounty"
                  suffix="M3GA ($25,000)" 
                />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-[#a5b4fc] font-bold uppercase block">Contenders</span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">
                      {viewingTournament.registeredPlayers.length} / {viewingTournament.maxPlayers} Filled
                    </span>
                  </div>
                  {!isRegistered(viewingTournament.name) ? (
                    <button 
                      onClick={() => handleRegister(viewingTournament)}
                      disabled={viewingTournament.registeredPlayers.length >= viewingTournament.maxPlayers}
                      className="py-3 px-6 rounded-xl cyber-btn text-white font-black text-xs uppercase tracking-widest cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <div className="py-2.5 px-4 rounded-xl bg-green-950/80 border border-green-500/50 text-green-300 text-xs font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Pass Secured
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Knockout Bracket Component */}
              <TournamentBracketView tournamentName={viewingTournament.name} />

              {/* Rules of Engagement */}
              <div className="p-5 rounded-2xl bg-[#0b0b2b]/70 border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-cyan-400" /> Rules & Tournament Regulations
                </h4>
                <p className="text-[#a5b4fc] font-medium leading-relaxed whitespace-pre-line text-xs">
                  {viewingTournament.rules}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner with Large Glowing Prize Pool & View Switcher */}
      <div className="cyber-card p-6 sm:p-8 rounded-[24px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-black uppercase tracking-widest text-purple-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                <Sparkles size={12} className="text-cyan-300" /> PRO LEAGUE CIRCUIT
              </span>
              <span className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-widest">Season 5 Playoffs</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl text-white uppercase tracking-tight">
              CYBER <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 text-glow-purple">TOURNAMENTS</span>
            </h1>

            <p className="text-sm text-[#a5b4fc] font-normal leading-relaxed">
              Enter official sanctioned brackets, track live match node advancements with glowing drawing paths, and secure your arena pass to the grand championship.
            </p>

            {/* TAB VIEW SWITCHER: Tournament Cards vs Knockout Bracket */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('tournaments')}
                className={`py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'tournaments'
                    ? 'cyber-btn shadow-[0_0_20px_rgba(168,85,247,0.5)] text-white'
                    : 'bg-[#0b0b2b]/70 border border-purple-500/25 text-[#a5b4fc] hover:text-white'
                }`}
              >
                <Layers size={14} />
                <span>Tournament Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bracket')}
                className={`py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'bracket'
                    ? 'cyber-btn shadow-[0_0_20px_rgba(168,85,247,0.5)] text-white'
                    : 'bg-[#0b0b2b]/70 border border-purple-500/25 text-[#a5b4fc] hover:text-white'
                }`}
              >
                <Swords size={14} />
                <span>Live Bracket Tree</span>
              </button>
            </div>
          </div>

          {/* LARGE GLOWING PRIZE POOL (Count-up with IntersectionObserver) */}
          <div className="p-6 rounded-2xl bg-[#07051a]/90 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)] min-w-[280px]">
            <GlowingPrizePool 
              amount={125000} 
              prefix=""
              suffix="M3GA" 
              label="Active Season Total Prize Pool" 
            />
            <div className="pt-3 mt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-[#a5b4fc]">
              <span className="font-mono">Est. USD: $625,000</span>
              <span className="text-green-400 font-bold uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 live-dot-pulse" /> 4 Cups Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: KNOCKOUT BRACKET VIEW */}
      {activeTab === 'bracket' && (
        <div className="cyber-card p-5 sm:p-8 rounded-[24px] space-y-6 animate-in fade-in duration-200">
          <TournamentBracketView />
        </div>
      )}

      {/* TAB CONTENT 2: TOURNAMENTS GRID */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {[
                { id: 'all', label: 'All Tournaments' },
                { id: 'active', label: 'Live Now 🔴' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'enrolled', label: `My Passes (${tickets.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                      : 'bg-[#0b0b2b]/70 text-[#a5b4fc] hover:text-white hover:bg-purple-950/50 border border-purple-500/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b0b2b]/80 border border-purple-500/30 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-purple-400/50 focus:border-purple-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Tournaments Grid Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(t => {
              const registered = isRegistered(t.name);
              const slotsTaken = t.registeredPlayers.length;
              const isFull = slotsTaken >= t.maxPlayers;
              const capacityPercent = Math.min(Math.round((slotsTaken / t.maxPlayers) * 100), 100);

              return (
                <div 
                  key={t.id} 
                  className={`arena-card-hover rounded-[20px] border overflow-hidden flex flex-col group bg-[#0b0b2b]/90 backdrop-blur-sm ${
                    registered 
                      ? 'border-green-500/40 shadow-[0_0_24px_rgba(34,197,94,0.15)]' 
                      : t.status === 'active'
                      ? 'border-cyan-400/50 shadow-[0_0_24px_rgba(34,211,238,0.25)]'
                      : 'border-purple-500/30 hover:border-purple-400/60'
                  }`}
                >
                  {/* Card Banner Cover */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/60">
                    <img 
                      src={t.banner || '/src/assets/images/cyber_neon_arena_1792040308858.jpg'} 
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b2b] via-[#0b0b2b]/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        t.status === 'active'
                          ? 'bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.5)] flex items-center gap-1.5'
                          : registered
                          ? 'bg-green-950/90 text-green-300 border-green-500/40'
                          : 'bg-black/70 text-purple-300 border-purple-500/30'
                      }`}>
                        {t.status === 'active' && <span className="w-2 h-2 rounded-full bg-rose-500 live-dot-pulse" />}
                        {t.status === 'active' ? 'LIVE NOW' : registered ? 'PASS SECURED ✓' : t.status.toUpperCase()}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/70 text-cyan-300 border border-purple-500/40">
                        {t.game}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-[#a5b4fc] uppercase">Prize Bounty</p>
                        <p className="text-xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-cyan-300 font-bold">
                          {t.prize}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#a5b4fc] bg-black/70 px-2 py-0.5 rounded-md border border-purple-500/30">
                        Fee: {t.entryFee} M3GA
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow space-y-4">
                    <div>
                      <h4 
                        onClick={() => setViewingTournament(t)}
                        className="font-heading text-lg text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {t.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#a5b4fc] mt-1">
                        <Clock size={12} className="text-cyan-400" />
                        <span>{t.date}</span>
                      </div>
                    </div>

                    {/* Contenders Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-extrabold uppercase">
                        <span className="text-[#a5b4fc]">Contenders</span>
                        <span className="text-cyan-300 font-mono">{slotsTaken} / {t.maxPlayers} ({capacityPercent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#07051a] rounded-full overflow-hidden border border-purple-500/20">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-500"
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 mt-auto grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setViewingTournament(t)}
                        className="py-2.5 bg-[#07051a] hover:bg-purple-950/60 text-[#a5b4fc] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Swords size={12} className="text-cyan-300" /> Bracket & Rules
                      </button>

                      <button
                        onClick={() => handleRegister(t)}
                        disabled={registered || isFull}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          registered
                            ? 'bg-green-950/80 border border-green-500/40 text-green-300 cursor-default'
                            : isFull
                            ? 'bg-rose-950/40 border border-rose-500/30 text-rose-400 cursor-not-allowed opacity-60'
                            : 'cyber-btn text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        {registered ? (
                          <>Pass Secured <CheckCircle2 size={12} /></>
                        ) : isFull ? (
                          <>Arena Full</>
                        ) : (
                          <>Register <Zap size={12} className="text-cyan-200" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPanel;
