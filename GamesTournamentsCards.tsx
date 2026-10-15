import React, { useState } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Swords, 
  Users, 
  Flame, 
  Sparkles, 
  Clock, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Shield, 
  Play, 
  Zap, 
  Calendar, 
  Coins, 
  QrCode, 
  X, 
  ArrowRight, 
  Layers, 
  Radio, 
  Target,
  Gift,
  Award,
  Filter
} from 'lucide-react';
import { 
  GameCardItem, 
  Tournament, 
  Ticket, 
  PlayerProfile, 
  Fixture, 
  DailyQuest, 
  Stream,
  TournamentBracketMatch 
} from './types.ts';

interface GamesTournamentsCardsProps {
  games: GameCardItem[];
  tournaments: Tournament[];
  fixtures: Fixture[];
  quests: DailyQuest[];
  streams: Stream[];
  profile: PlayerProfile;
  tickets: Ticket[];
  onPlayGame: (game: GameCardItem) => void;
  onRegisterTournament: (t: Tournament) => Ticket | undefined;
  onClaimQuestReward?: (questId: string, reward: number, xp: number) => void;
  onOpenDuels?: () => void;
  onOpenFixtures?: () => void;
  onOpenStreams?: () => void;
}

type CardFilterTab = 'all' | 'games' | 'tournaments' | 'duels' | 'fixtures' | 'quests';

export const GamesTournamentsCards: React.FC<GamesTournamentsCardsProps> = ({
  games,
  tournaments,
  fixtures,
  quests,
  streams,
  profile,
  tickets,
  onPlayGame,
  onRegisterTournament,
  onClaimQuestReward,
  onOpenDuels,
  onOpenFixtures,
  onOpenStreams,
}) => {
  const [activeTab, setActiveTab] = useState<CardFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  
  // Modals state
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [successTicket, setSuccessTicket] = useState<Ticket | null>(null);
  const [showQuickMatchModal, setShowQuickMatchModal] = useState<GameCardItem | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [localQuests, setLocalQuests] = useState<DailyQuest[]>(quests);

  // Sync external quests updates
  React.useEffect(() => {
    setLocalQuests(quests);
  }, [quests]);

  const isTournamentRegistered = (tournamentName: string) => {
    return tickets.some(t => t.tournamentName === tournamentName);
  };

  const handleRegister = (t: Tournament) => {
    const ticket = onRegisterTournament(t);
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

  const handleClaimQuest = (quest: DailyQuest) => {
    if (!quest.completed || quest.claimed) return;
    setLocalQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q));
    if (onClaimQuestReward) {
      onClaimQuestReward(quest.id, quest.reward, quest.xp);
    }
  };

  const handleStartQuickMatch = (game: GameCardItem) => {
    setShowQuickMatchModal(game);
    setMatchmakingStatus('searching');
    setTimeout(() => {
      setMatchmakingStatus('found');
    }, 1800);
  };

  const handleLaunchFoundMatch = (game: GameCardItem) => {
    setShowQuickMatchModal(null);
    setMatchmakingStatus('idle');
    onPlayGame(game);
  };

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();

  const filteredGames = games.filter(g => {
    const matchesSearch = !query || g.name.toLowerCase().includes(query) || g.genre.toLowerCase().includes(query) || g.description.toLowerCase().includes(query);
    const matchesCategory = selectedGameFilter === 'all' || g.genre.toLowerCase().includes(selectedGameFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = !query || t.name.toLowerCase().includes(query) || t.game.toLowerCase().includes(query);
    return matchesSearch;
  });

  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = !query || f.teamA.toLowerCase().includes(query) || f.teamB.toLowerCase().includes(query) || f.tournamentName.toLowerCase().includes(query);
    return matchesSearch;
  });

  const filteredQuests = localQuests.filter(q => {
    const matchesSearch = !query || q.title.toLowerCase().includes(query);
    return matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Search & Filter Deck Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.18)] bg-[#0d0824]/90 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-cyan-500/10 via-purple-600/10 to-transparent pointer-events-none rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                <Sparkles size={11} className="text-cyan-300" /> Card Showcase
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Real-Time Arena & Circuits
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200 uppercase tracking-tight">
              Games, Tournaments & Action Deck
            </h3>
          </div>

          {/* Realtime Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/70" size={16} />
            <input 
              type="text" 
              placeholder="Search games, tournaments, teams..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#150d30]/90 border border-purple-500/35 hover:border-cyan-400/50 rounded-2xl py-3 pl-11 pr-10 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 shadow-inner transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-5 pb-1 border-t border-purple-500/20 mt-5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400/50'
                : 'bg-purple-950/40 text-zinc-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            <Layers size={13} className="text-cyan-300" /> All Cards
          </button>
          
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400/50'
                : 'bg-purple-950/40 text-zinc-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            <Gamepad2 size={13} className="text-purple-300" /> Available Games ({games.length})
          </button>

          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/50'
                : 'bg-purple-950/40 text-zinc-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            <Trophy size={13} className="text-amber-300" /> Tournaments ({tournaments.length})
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-rose-400/50'
                : 'bg-purple-950/40 text-zinc-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            <Calendar size={13} className="text-rose-300" /> Matches & Fixtures ({fixtures.length})
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quests'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400/50'
                : 'bg-purple-950/40 text-zinc-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            <Gift size={13} className="text-amber-300" /> Daily Quests ({localQuests.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. AVAILABLE GAMES CARDS DECK                            */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'games') && (
        <section className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_16px_rgba(168,85,247,0.5)]">
                <Gamepad2 size={20} />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Available Games
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
                    {filteredGames.length}
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  Real-time playable arenas, retro racers & tactical duel battlegrounds
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id}
                className="glass-panel rounded-3xl border border-purple-500/25 bg-[#0f0a28]/85 overflow-hidden flex flex-col group hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-all duration-400 hover:-translate-y-1.5 relative"
              >
                {/* Banner & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-black/60">
                  <img 
                    src={game.image} 
                    alt={game.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/cyber_game_showcase_1792040326809.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a28] via-[#0f0a28]/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/40 shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {game.genre}
                    </span>

                    {game.badge && (
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                        game.badge === 'FLAGSHIP TITLE'
                          ? 'bg-purple-900/80 text-purple-200 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                          : game.badge === 'PLAYABLE NOW'
                          ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                          : 'bg-amber-900/80 text-amber-200 border-amber-400/60'
                      }`}>
                        {game.badge}
                      </span>
                    )}
                  </div>

                  {/* Rating & Live Players */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-yellow-300 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 font-mono">
                      ★ {game.rating.toFixed(1)}
                    </span>
                    <span className="text-zinc-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                      <Users size={11} className="text-purple-300" /> {game.playersCount}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <div>
                    <h5 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-cyan-200 transition-colors">
                      {game.name}
                    </h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                      {game.description}
                    </p>
                  </div>

                  {/* Modes Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {game.modes.map((mode, idx) => (
                      <span 
                        key={idx}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/25"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>

                  {/* Tournaments info pill */}
                  <div className="flex items-center justify-between text-[10px] font-bold pt-2 border-t border-purple-500/15 text-zinc-400">
                    <span className="flex items-center gap-1 text-purple-300">
                      <Trophy size={12} className="text-amber-400" /> {game.tournamentsCount} Tournaments
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {game.difficulty} Tier
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onPlayGame(game)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_22px_rgba(56,189,248,0.6)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play size={12} className="fill-white" /> Play Now
                    </button>

                    <button
                      onClick={() => handleStartQuickMatch(game)}
                      className="w-full py-2.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/30 hover:border-cyan-400/40 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap size={12} className="text-cyan-300" /> Scrim Duel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. TOURNAMENTS CARDS DECK                                */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'tournaments') && (
        <section className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(6,182,212,0.5)]">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Championship Tournaments
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono">
                    {filteredTournaments.length}
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  High-stakes prize pools, verified brackets & season access passes
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => {
              const registered = isTournamentRegistered(t.name);
              const percentCapacity = Math.min(Math.round((t.registeredPlayers.length / t.maxPlayers) * 100), 100);

              return (
                <div 
                  key={t.id}
                  className={`glass-panel rounded-3xl border overflow-hidden flex flex-col group transition-all duration-400 hover:-translate-y-1.5 relative ${
                    t.status === 'active'
                      ? 'border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-[#0d0926]/90'
                      : 'border-purple-500/25 bg-[#0e0a24]/85 hover:border-purple-400/60'
                  }`}
                >
                  {/* Tournament Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/60">
                    <img 
                      src={t.banner || '/src/assets/images/cyber_neon_arena_1792040308858.jpg'} 
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a24] via-[#0e0a24]/40 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        t.status === 'active'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.6)] flex items-center gap-1.5'
                          : t.status === 'completed'
                          ? 'bg-zinc-900/80 text-zinc-400 border-white/10'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1.5'
                      }`}>
                        {t.status === 'active' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                        {t.status === 'upcoming' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        {t.status === 'active' ? 'LIVE NOW 🔴' : t.status === 'completed' ? 'COMPLETED' : 'REGISTRATION OPEN'}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-purple-300 border border-purple-500/30">
                        {t.game}
                      </span>
                    </div>

                    {/* Prize pool overlay */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Guaranteed Prize</p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                          {t.prize}
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        Fee: {t.entryFee} M3GA
                      </span>
                    </div>
                  </div>

                  {/* Content & Details */}
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div>
                      <h5 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                        {t.name}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 mt-1">
                        <Clock size={12} className="text-cyan-400" />
                        <span>{t.date}</span>
                      </div>
                    </div>

                    {/* Slots progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider">
                        <span className="text-zinc-400">Registered Slots</span>
                        <span className="text-cyan-300 font-mono">
                          {t.registeredPlayers.length} / {t.maxPlayers} ({percentCapacity}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-purple-500/25">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
                          style={{ width: `${percentCapacity}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 mt-auto grid grid-cols-2 gap-2.5">
                      {registered ? (
                        <div className="py-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 size={13} /> Pass Issued
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(t)}
                          disabled={t.status === 'completed'}
                          className="py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_22px_rgba(56,189,248,0.6)] active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Zap size={12} className="text-cyan-200" /> Register Now
                        </button>
                      )}

                      <button
                        onClick={() => setViewingTournament(t)}
                        className="py-2.5 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/30 hover:border-cyan-400/40 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Shield size={12} className="text-purple-300" /> Rules & Bracket
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. RELATED CARDS (FIXTURES, DUELS, DAILY QUESTS)         */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'fixtures' || activeTab === 'quests') && (
        <div className="grid lg:grid-cols-2 gap-8 pt-2">
          {/* Matches & Head-to-Head Fixtures Cards */}
          {(activeTab === 'all' || activeTab === 'fixtures') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Swords size={16} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Active Fixture Cards</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Head-to-head live & upcoming duels</p>
                  </div>
                </div>
                {onOpenFixtures && (
                  <button onClick={onOpenFixtures} className="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1 hover:text-white">
                    Full Schedule <ChevronRight size={12} />
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                {filteredFixtures.slice(0, 3).map((f) => (
                  <div 
                    key={f.id}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 bg-[#0d0922]/80 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 w-full sm:w-auto text-center sm:text-left">
                      <span className="text-[9px] font-black text-purple-300 uppercase px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/25">
                        {f.tournamentName}
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-bold text-zinc-400 mt-1">
                        <Clock size={11} className="text-rose-400" /> {f.time} • {f.date}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                      <span className="text-xs font-black text-white uppercase text-right truncate max-w-[110px] sm:max-w-[130px]">
                        {f.teamA}
                      </span>
                      <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-purple-500/30 text-[9px] font-black text-cyan-300 font-mono">
                        VS
                      </div>
                      <span className="text-xs font-black text-white uppercase truncate max-w-[110px] sm:max-w-[130px]">
                        {f.teamB}
                      </span>
                    </div>

                    <button 
                      onClick={onOpenFixtures}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-[9px] font-black text-purple-200 hover:text-white uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      Predict
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Daily Quests & Bounties Cards */}
          {(activeTab === 'all' || activeTab === 'quests') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Gift size={16} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Daily Quests & Bounties</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Complete challenges for M3GA coins & XP</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                {filteredQuests.slice(0, 3).map((q) => (
                  <div 
                    key={q.id}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-purple-500/20 hover:border-amber-400/40 bg-[#0d0922]/80 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-grow w-full sm:w-auto">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <h5 className="text-xs font-black text-white uppercase">{q.title}</h5>
                        <span className="text-[9px] font-mono text-cyan-300 font-extrabold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                          +{q.reward} M3GA
                        </span>
                      </div>
                      
                      {/* Quest progress bar */}
                      <div className="w-full sm:max-w-xs h-1.5 bg-black/60 rounded-full overflow-hidden border border-purple-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min((q.progress / q.maxProgress) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
                        Progress: {q.progress} / {q.maxProgress} • +{q.xp} XP
                      </p>
                    </div>

                    <div>
                      {q.claimed ? (
                        <span className="text-[9px] font-black uppercase text-zinc-500 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5">
                          Claimed ✓
                        </span>
                      ) : q.completed ? (
                        <button
                          onClick={() => handleClaimQuest(q)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Coins size={12} /> Claim Reward
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold text-zinc-400 uppercase px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: TOURNAMENT RULES & BRACKET VIEWER               */}
      {/* ======================================================== */}
      {viewingTournament && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-[#0d0924]/95 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-purple-500/25 flex items-center justify-between sticky top-0 bg-[#090518]/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    {viewingTournament.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                      {viewingTournament.game}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {viewingTournament.date}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewingTournament(null)}
                className="p-2.5 rounded-full bg-purple-950/60 hover:bg-purple-900/80 text-zinc-400 hover:text-white border border-purple-500/30 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
              {/* Prize & Status summary banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#140e32] border border-purple-500/25">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Prize Pool</p>
                  <p className="text-lg font-black text-amber-300 font-mono">{viewingTournament.prize}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Entry Fee</p>
                  <p className="text-lg font-black text-cyan-300 font-mono">{viewingTournament.entryFee} M3GA</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Max Players</p>
                  <p className="text-lg font-black text-purple-300 font-mono">{viewingTournament.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">Enrolled</p>
                  <p className="text-lg font-black text-white font-mono">{viewingTournament.registeredPlayers.length}</p>
                </div>
              </div>

              {/* Tournament Knockout Bracket Visualization */}
              {viewingTournament.bracket && viewingTournament.bracket.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} /> Official Knockout Bracket
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {viewingTournament.bracket.map((match) => (
                      <div 
                        key={match.id}
                        className="p-4 rounded-2xl bg-black/50 border border-purple-500/25 space-y-3 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center text-[9px] font-extrabold uppercase">
                          <span className="text-purple-300">{match.round}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            match.status === 'live' 
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse' 
                              : match.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {match.status}
                          </span>
                        </div>

                        {/* Team A */}
                        <div className={`p-2.5 rounded-xl border flex justify-between items-center text-xs font-bold ${
                          match.winner === match.teamA 
                            ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-200' 
                            : 'bg-white/5 border-white/5 text-zinc-300'
                        }`}>
                          <span className="truncate">{match.teamA}</span>
                          {match.scoreA !== undefined && (
                            <span className="font-mono text-cyan-300 font-black">{match.scoreA}</span>
                          )}
                        </div>

                        {/* Team B */}
                        <div className={`p-2.5 rounded-xl border flex justify-between items-center text-xs font-bold ${
                          match.winner === match.teamB 
                            ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-200' 
                            : 'bg-white/5 border-white/5 text-zinc-300'
                        }`}>
                          <span className="truncate">{match.teamB}</span>
                          {match.scoreB !== undefined && (
                            <span className="font-mono text-cyan-300 font-black">{match.scoreB}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tournament Rules */}
              <section className="space-y-3">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} /> Rules of Engagement
                </h4>
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/20 text-xs text-zinc-300 font-medium whitespace-pre-line leading-relaxed">
                  {viewingTournament.rules}
                </div>
              </section>

              {/* Registered Roster */}
              <section className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} /> Enrolled Players & Teams ({viewingTournament.registeredPlayers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewingTournament.registeredPlayers.map((name, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-xs font-bold text-white flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {name}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#090518]/90">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">
                {isTournamentRegistered(viewingTournament.name) ? 'You hold an active pass for this tournament' : 'Slots are filling fast! Confirm entry'}
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setViewingTournament(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Close
                </button>

                {!isTournamentRegistered(viewingTournament.name) && (
                  <button
                    onClick={() => handleRegister(viewingTournament)}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap size={13} className="text-cyan-200" /> Confirm Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TICKET PASS CONFIRMATION MODAL                  */}
      {/* ======================================================== */}
      {successTicket && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-md rounded-[2.5rem] overflow-hidden border border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)] bg-[#0d0924]/95 animate-in zoom-in-95 duration-400">
            <div className="p-8 flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Arena Pass Confirmed</h3>
              <p className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest">Your deployment clearance has been verified</p>
              
              <div className="w-full p-6 bg-white rounded-3xl shadow-inner mt-2">
                <QrCode size={160} className="text-black mx-auto" />
                <p className="mt-3 text-black font-mono font-black text-xs tracking-widest uppercase">{successTicket.id}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white uppercase">{successTicket.tournamentName}</h4>
                <p className="text-cyan-400 font-extrabold text-[10px] uppercase tracking-widest font-mono">{successTicket.date}</p>
              </div>

              <button 
                onClick={() => setSuccessTicket(null)}
                className="w-full py-4 bg-purple-950/60 hover:bg-purple-900/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all border border-purple-500/40 shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: QUICK SCRIM / MATCHMAKING MODAL                 */}
      {/* ======================================================== */}
      {showQuickMatchModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-md rounded-[2.5rem] border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.35)] bg-[#0d0924]/95 p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Zap size={32} className="animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {showQuickMatchModal.name}
              </h3>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mt-1">
                {matchmakingStatus === 'searching' ? 'Scanning Global Lobbies & Server Ping...' : 'Opponent Found! Ready to Battle'}
              </p>
            </div>

            {matchmakingStatus === 'searching' ? (
              <div className="space-y-4 w-full py-4">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-500/30 border-t-cyan-400 animate-spin" />
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Latency: 24ms • Region: EU-Central</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/60 border border-cyan-400/50 w-full space-y-2 animate-in zoom-in-95">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Matched Contender</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-black text-white uppercase">BakugoBoom</span>
                  <span className="text-xs font-mono text-cyan-300 font-black">Rank 14</span>
                </div>
                <p className="text-[9px] text-amber-300 font-mono">Wager: 20 M3GA Coins</p>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setShowQuickMatchModal(null); setMatchmakingStatus('idle'); }}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>

              {matchmakingStatus === 'found' && (
                <button
                  onClick={() => handleLaunchFoundMatch(showQuickMatchModal)}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Play size={12} className="fill-white" /> Enter Match
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
