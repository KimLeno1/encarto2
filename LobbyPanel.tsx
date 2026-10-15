import React from 'react';
import { 
  Crown, 
  Zap, 
  Plus, 
  Trophy, 
  Users, 
  ChevronRight, 
  Swords, 
  Newspaper, 
  MonitorPlay, 
  ShoppingBag, 
  Medal,
  Clock,
  Radio,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { 
  PlayerProfile, 
  Team, 
  Tournament, 
  PanelType, 
  HallOfFameEntry, 
  BlogPost, 
  Fixture, 
  ShopItem, 
  Stream,
  Ticket,
  GameCardItem,
  DailyQuest
} from './types.ts';
import { AVAILABLE_GAMES, INITIAL_DAILY_QUESTS } from './mockData.ts';
import { GamesTournamentsCards } from './GamesTournamentsCards.tsx';

interface LobbyPanelProps {
  profile: PlayerProfile;
  myTeam: Team | null;
  upcomingTournaments: Tournament[];
  hallOfFame: HallOfFameEntry[];
  blogPosts: BlogPost[];
  fixtures: Fixture[];
  shopItems: ShopItem[];
  streams: Stream[];
  tickets: Ticket[];
  onPanelChange: (panel: PanelType) => void;
  onWalletTab: () => void;
  onRegisterTournament: (t: Tournament) => Ticket | undefined;
  onPlayGame: (game: GameCardItem) => void;
  onClaimQuestReward?: (questId: string, reward: number, xp: number) => void;
}

const LobbyPanel: React.FC<LobbyPanelProps> = ({ 
  profile, 
  myTeam, 
  upcomingTournaments, 
  hallOfFame,
  blogPosts,
  fixtures,
  shopItems,
  streams,
  tickets,
  onPanelChange, 
  onWalletTab,
  onRegisterTournament,
  onPlayGame,
  onClaimQuestReward
}) => {
  const nextLevelExp = (profile.rank + 1) * 500;
  const xpPercentage = Math.min((profile.exp / nextLevelExp) * 100, 100);
  
  const top3HOF = hallOfFame.slice(0, 3);
  const latestBlogs = blogPosts.slice(0, 2);
  const liveStreams = streams.filter(s => s.isLive).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-28 px-1 sm:px-2 relative z-10">
      {/* Motto Section with Neon Accents */}
      <div className="text-center py-3 sm:py-5">
        <div className="inline-block relative">
          <h2 
            style={{ 
              fontFamily: 'Outfit, sans-serif', 
              color: '#f5f3ff', 
              textDecoration: 'underline', 
              textDecorationColor: '#38bdf8',
              textUnderlineOffset: '8px',
              textDecorationThickness: '3px'
            }} 
            className="text-3xl md:text-4xl font-black italic uppercase leading-tight drop-shadow-[0_0_22px_rgba(168,85,247,0.45)] tracking-wide"
          >
            "tell the world that i am here"
          </h2>
          <div className="absolute -top-3 -right-6 text-cyan-300 animate-bounce">
            <Zap size={18} className="fill-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
        </div>
      </div>

      {/* Profile Card with Glowing Light Purple Aura */}
      <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-[2.5rem] border-2 border-purple-400/50 flex flex-col md:flex-row items-center gap-7 md:gap-10 shadow-[0_0_45px_rgba(192,132,252,0.35)] relative overflow-hidden group hover:border-purple-300 transition-all duration-500 bg-gradient-to-r from-[#26124d]/95 via-[#1d0e40]/95 to-[#261048]/95">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 text-purple-300">
          <Crown size={180} />
        </div>
        <div className="relative">
          <img 
            src={profile.avatar} 
            className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 p-1.5 transition-all duration-500 ring-2 ring-purple-400/60 shadow-[0_0_35px_rgba(192,132,252,0.55)] ${profile.activeDecoration ? 'border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.6)]' : 'border-purple-300/60'}`} 
            alt="User" 
          />
          {profile.activePlugin && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-cyan-400 text-white p-3 rounded-2xl shadow-[0_0_18px_rgba(192,132,252,0.8)] animate-bounce border-2 border-purple-900">
              <Zap size={20} className="fill-white" />
            </div>
          )}
        </div>
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-fuchsia-100 to-cyan-200 uppercase tracking-tight drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]">
              {profile.name}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5">
              <span className="font-extrabold uppercase tracking-widest text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(192,132,252,0.4)]">
                Rank {profile.rank}
              </span>
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              <span className="text-cyan-300 font-bold uppercase tracking-widest text-[10px]">
                {profile.team}
              </span>
            </div>
          </div>

          <div className="pt-2 max-w-sm mx-auto md:mx-0">
            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest mb-1.5 text-purple-300/80">
              <span>XP Progress</span>
              <span className="text-cyan-300 font-mono">{Math.floor(xpPercentage)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-purple-400/40 relative">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_14px_rgba(192,132,252,0.8)]" 
                style={{ width: `${xpPercentage}%` }} 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-purple-500/20 inline-block w-full">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div>
                <p className="text-[10px] font-bold text-purple-300/80 uppercase tracking-widest mb-1">Account Balance</p>
                <h5 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-mono tabular-nums">
                  {profile.balance.toFixed(2)} <span className="text-xs text-cyan-300 font-sans tracking-widest">M3GA</span>
                </h5>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button 
                  onClick={() => onPanelChange(PanelType.ARENA)} 
                  className="px-7 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_28px_rgba(192,132,252,0.6)] hover:shadow-[0_0_38px_rgba(34,211,238,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-purple-300/60 cursor-pointer"
                >
                  <Swords size={16} className="text-cyan-200" /> ENTER ARENA (PVP & BOT HUB)
                </button>
                <button 
                  onClick={onWalletTab} 
                  className="px-6 py-3.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-400/40 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(192,132,252,0.25)]"
                >
                  <Plus size={15} className="text-cyan-300" /> DEPOSIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARDS HUB: AVAILABLE GAMES, TOURNAMENTS & RELATED CARDS   */}
      {/* ======================================================== */}
      <GamesTournamentsCards
        games={AVAILABLE_GAMES}
        tournaments={upcomingTournaments}
        fixtures={fixtures}
        quests={INITIAL_DAILY_QUESTS}
        streams={streams}
        profile={profile}
        tickets={tickets}
        onPlayGame={onPlayGame}
        onRegisterTournament={onRegisterTournament}
        onClaimQuestReward={onClaimQuestReward}
        onOpenDuels={() => onPanelChange(PanelType.PVP)}
        onOpenFixtures={() => onPanelChange(PanelType.FIXTURES)}
        onOpenStreams={() => onPanelChange(PanelType.STREAMING)}
      />

      {/* Top 3 Hall of Fame Sovereigns */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="anime-title text-xl sm:text-2xl uppercase flex items-center gap-3 text-white">
            <Medal size={20} className="text-yellow-400" /> Current Sovereigns
          </h4>
          <button 
            onClick={() => onPanelChange(PanelType.HALL_OF_FAME)} 
            className="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1 group hover:text-white"
          >
            Full Gallery <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3HOF.map((winner, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-6 rounded-[2rem] border transition-all hover:scale-[1.02] bg-[#0d0922]/80 ${
                idx === 0 
                  ? 'border-yellow-400/40 shadow-[0_0_25px_rgba(250,204,21,0.2)]' 
                  : 'border-purple-500/20 hover:border-cyan-400/40'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                  idx === 0 
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-lg shadow-yellow-500/30' 
                    : 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h5 className="text-sm font-black text-white uppercase">{winner.winnerName}</h5>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Rank {winner.rankAtWin} Champion</p>
                </div>
              </div>
              <div className="pt-4 border-t border-purple-500/15">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Crowned At</p>
                <p className="text-[10px] font-bold text-cyan-200 uppercase truncate">{winner.tournamentName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blogs & Streams Grid */}
      <div className="grid lg:grid-cols-2 gap-8 pt-4">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-xl uppercase flex items-center gap-2.5 text-white">
              <Newspaper size={18} className="text-purple-400" /> The Signal & Dispatch
            </h4>
            <button onClick={() => onPanelChange(PanelType.BLOG)} className="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1 hover:text-white">
              Feed <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid gap-3.5">
            {latestBlogs.map(post => (
              <div 
                key={post.id} 
                className="glass-panel p-4 rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 bg-[#0d0922]/80 flex gap-4 transition-all group cursor-pointer" 
                onClick={() => onPanelChange(PanelType.BLOG)}
              >
                <img src={post.image} className="w-20 h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="Blog" />
                <div className="flex-grow min-w-0 flex flex-col justify-center">
                  <h5 className="text-xs font-black text-white uppercase truncate mb-1 group-hover:text-cyan-200">{post.title}</h5>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-xl uppercase flex items-center gap-2.5 text-white">
              <MonitorPlay size={18} className="text-cyan-400" /> Arena Broadcasts
            </h4>
            <button onClick={() => onPanelChange(PanelType.STREAMING)} className="text-[10px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1 hover:text-white">
              Watch Live <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid gap-3.5">
            {liveStreams.map(stream => (
              <div 
                key={stream.id} 
                className="glass-panel p-4 rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 bg-[#0d0922]/80 flex items-center gap-4 transition-all group cursor-pointer" 
                onClick={() => onPanelChange(PanelType.STREAMING)}
              >
                <div className="relative">
                  <img src={stream.thumbnail} className="w-16 h-12 rounded-xl object-cover" alt="Stream" />
                  <div className="absolute -top-1 -left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[7px] font-black animate-pulse">LIVE</div>
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase truncate group-hover:text-cyan-200">{stream.title}</h5>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase mt-1 flex items-center gap-1">
                    <Radio size={9} className="text-rose-400" /> {stream.streamer} • {stream.viewers} watching
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LobbyPanel;
