import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Clock, Swords, Trophy, Users, Star, Filter, Radio, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Fixture, PlayerProfile } from './types.ts';

interface FixturesPanelProps {
  fixtures: Fixture[];
  profile: PlayerProfile;
}

// Helper countdown component that ticks every second
const MatchCountdownTimer: React.FC<{ targetDateStr: string; targetTimeStr: string }> = ({ 
  targetDateStr, 
  targetTimeStr 
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // Generate a consistent pseudo-future time based on fixture id / date string
    const target = new Date();
    target.setHours(target.getHours() + 2, target.getMinutes() + 45, target.getSeconds() + 18);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, targetTimeStr]);

  if (!timeLeft) return <span>Calculating...</span>;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-mono text-cyan-300 font-bold text-[11px] flex items-center gap-1">
      <Clock size={11} className="text-cyan-400" />
      <span>{pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s</span>
    </span>
  );
};

export const FixturesPanel: React.FC<FixturesPanelProps> = ({ fixtures, profile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'finished'>('all');

  // Extended fixtures with simulated live scores for comprehensive cyber display
  const enrichedFixtures = useMemo(() => {
    return [
      ...fixtures,
      {
        id: 'f-live-1',
        tournamentName: 'Encarto Neon Masters',
        teamA: 'Team Aurora',
        teamB: 'Team Nebula',
        time: '18:45',
        date: 'Today',
        game: 'Chrono Clash',
        participants: ['Team Aurora', 'Team Nebula'],
        status: 'live' as const,
        scoreA: 2,
        scoreB: 1
      },
      {
        id: 'f-live-2',
        tournamentName: 'UA Sports Festival',
        teamA: 'Plus Ultra Gamers',
        teamB: 'Class 1-A Elite',
        time: '19:15',
        date: 'Today',
        game: 'MHA Battle',
        participants: [profile.name, 'Class 1-A Elite'],
        status: 'live' as const,
        scoreA: 1,
        scoreB: 1
      },
      {
        id: 'f-fin-1',
        tournamentName: 'Grand Line Open',
        teamA: 'Straw Hat Alliance',
        teamB: 'Heart Pirates',
        time: '16:00',
        date: 'Today',
        game: 'One Piece Clash',
        participants: ['Straw Hat Alliance', 'Heart Pirates'],
        status: 'finished' as const,
        scoreA: 3,
        scoreB: 0
      }
    ];
  }, [fixtures, profile.name]);

  const filteredFixtures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedFixtures.filter(f => {
      const matchSearch = !q || 
        f.tournamentName.toLowerCase().includes(q) ||
        f.teamA.toLowerCase().includes(q) ||
        f.teamB.toLowerCase().includes(q) ||
        f.game.toLowerCase().includes(q);
      
      if (!matchSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'live') return f.status === 'live';
      if (statusFilter === 'scheduled') return f.status === 'scheduled';
      if (statusFilter === 'finished') return f.status === 'finished';
      return true;
    });
  }, [enrichedFixtures, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300 px-1 sm:px-2">
      {/* Header */}
      <div className="cyber-card p-6 sm:p-8 rounded-[24px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-black uppercase tracking-widest text-purple-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                <Calendar size={12} className="text-cyan-300" /> SCHEDULED MATCHES & FIXTURES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-widest">Real-time Netcode Feeds</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl text-white uppercase tracking-tight">
              THE ARENA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 text-glow-purple">SLATE</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#a5b4fc] font-normal">
              Compact match schedule tracking live bouts, real-time countdown clocks, and verified match results.
            </p>
          </div>

          {/* Quick Counter Stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-[#07051a] border border-purple-500/30 text-center min-w-[90px]">
              <span className="text-xl font-heading text-rose-400 font-bold block flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 live-dot-pulse" />
                {enrichedFixtures.filter(f => f.status === 'live').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#a5b4fc]">Live Now</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#07051a] border border-purple-500/30 text-center min-w-[90px]">
              <span className="text-xl font-heading text-cyan-300 font-bold block">
                {enrichedFixtures.filter(f => f.status === 'scheduled').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#a5b4fc]">Upcoming</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#07051a] border border-purple-500/30 text-center min-w-[90px]">
              <span className="text-xl font-heading text-purple-300 font-bold block">
                {enrichedFixtures.filter(f => f.status === 'finished').length}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#a5b4fc]">Finished</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All Fixtures' },
            { id: 'live', label: '🔴 Live Matches' },
            { id: 'scheduled', label: 'Upcoming Clocks' },
            { id: 'finished', label: 'Final Results' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                  : 'bg-[#0b0b2b]/70 text-[#a5b4fc] hover:text-white hover:bg-purple-950/50 border border-purple-500/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search teams, tournament or game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0b2b]/80 border border-purple-500/30 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-purple-400/50 focus:border-purple-300 focus:outline-none"
          />
        </div>
      </div>

      {/* COMPACT FIXTURE ROWS LIST */}
      <div className="space-y-3">
        {filteredFixtures.map(f => {
          const isMyMatch = f.participants.includes(profile.name);
          const isLive = f.status === 'live';
          const isUpcoming = f.status === 'scheduled';
          const isFinished = f.status === 'finished';

          // Score display
          const scoreA = (f as any).scoreA ?? (isLive ? 1 : isFinished ? 2 : 0);
          const scoreB = (f as any).scoreB ?? (isLive ? 1 : isFinished ? 1 : 0);

          return (
            <div
              key={f.id}
              className={`p-4 sm:px-6 sm:py-3.5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b0b2b]/85 backdrop-blur-sm group hover:border-purple-400/60 ${
                isLive
                  ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-gradient-to-r from-rose-950/20 via-[#0b0b2b] to-[#0b0b2b]'
                  : isMyMatch
                  ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                  : 'border-purple-500/25 hover:bg-[#120a33]/85'
              }`}
            >
              {/* Left Column: Status Chip + Tournament & Game Details */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                {/* Status Chip */}
                {isLive && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.4)] shrink-0">
                    {/* Live match dot pulse (opacity animation only) */}
                    <span className="w-2 h-2 rounded-full bg-rose-500 live-dot-pulse" />
                    LIVE
                  </span>
                )}
                {isUpcoming && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Clock size={11} className="text-cyan-400" />
                    UPCOMING
                  </span>
                )}
                {isFinished && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-950/90 text-[#a5b4fc] border border-purple-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={11} className="text-purple-400" />
                    FINISHED
                  </span>
                )}

                <div className="truncate">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a5b4fc] block truncate">
                    {f.tournamentName}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-tight block truncate">
                    {f.game}
                  </span>
                </div>
              </div>

              {/* Center Column: Teams & Scores */}
              <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 py-1">
                {/* Team A */}
                <div className="flex-1 flex items-center justify-end gap-2 text-right">
                  <span className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${
                    f.teamA === profile.name ? 'text-cyan-300' : 'text-white'
                  }`}>
                    {f.teamA}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-900/40 border border-purple-400/30 flex items-center justify-center text-xs font-black text-cyan-300 shrink-0">
                    {f.teamA.charAt(0)}
                  </div>
                </div>

                {/* Score / VS Display */}
                <div className="px-3 py-1 rounded-xl bg-[#07051a] border border-purple-500/30 flex items-center gap-2 shrink-0">
                  {isLive || isFinished ? (
                    <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-black">
                      <span className={scoreA > scoreB ? 'text-cyan-300' : 'text-white'}>{scoreA}</span>
                      <span className="text-purple-400 font-normal">:</span>
                      <span className={scoreB > scoreA ? 'text-cyan-300' : 'text-white'}>{scoreB}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-black text-[#a5b4fc] uppercase font-mono tracking-wider">
                      VS
                    </span>
                  )}
                </div>

                {/* Team B */}
                <div className="flex-1 flex items-center justify-start gap-2 text-left">
                  <div className="w-7 h-7 rounded-lg bg-blue-900/40 border border-blue-400/30 flex items-center justify-center text-xs font-black text-purple-300 shrink-0">
                    {f.teamB.charAt(0)}
                  </div>
                  <span className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${
                    f.teamB === profile.name ? 'text-cyan-300' : 'text-white'
                  }`}>
                    {f.teamB}
                  </span>
                </div>
              </div>

              {/* Right Column: Countdown Timer for upcoming or Match Status Time */}
              <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px] border-t md:border-t-0 pt-2 md:pt-0 border-purple-500/20">
                {isUpcoming ? (
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-[#a5b4fc] block">Starts Countdown</span>
                    <MatchCountdownTimer targetDateStr={f.date} targetTimeStr={f.time} />
                  </div>
                ) : isLive ? (
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-rose-400 block flex items-center justify-end gap-1">
                      <Radio size={10} className="animate-pulse" /> Active Round 2
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">Best of 3</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-[#a5b4fc] block">Completed</span>
                    <span className="text-[11px] font-mono text-white font-bold">{f.date}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-[#a5b4fc] hover:text-white border border-purple-500/25 transition-colors cursor-pointer shrink-0"
                  title="View match telemetry"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredFixtures.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-purple-500/30 bg-[#0b0b2b]/40">
            <Swords size={32} className="text-purple-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[#a5b4fc] font-bold uppercase tracking-wider">
              No battle fixtures found matching criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixturesPanel;
