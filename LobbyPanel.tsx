
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
  Radio
} from 'lucide-react';
import { PlayerProfile, Team, Tournament, PanelType, HallOfFameEntry, BlogPost, Fixture, ShopItem, Stream } from './types.ts';

interface LobbyPanelProps {
  profile: PlayerProfile;
  myTeam: Team | null;
  upcomingTournaments: Tournament[];
  hallOfFame: HallOfFameEntry[];
  blogPosts: BlogPost[];
  fixtures: Fixture[];
  shopItems: ShopItem[];
  streams: Stream[];
  onPanelChange: (panel: PanelType) => void;
  onWalletTab: () => void;
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
  onPanelChange, 
  onWalletTab 
}) => {
  const nextLevelExp = (profile.rank + 1) * 500;
  const xpPercentage = Math.min((profile.exp / nextLevelExp) * 100, 100);
  
  const top3HOF = hallOfFame.slice(0, 3);
  const latestBlogs = blogPosts.slice(0, 2);
  const latestFixtures = fixtures.slice(0, 2);
  const featuredMerch = shopItems.filter(i => i.type === 'merch').slice(0, 3);
  const liveStreams = streams.filter(s => s.isLive).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24 px-1 sm:px-2">
      {/* Redesigned Motto Section */}
      <div className="text-center py-3 sm:py-5">
        <div className="inline-block relative">
          <h2 
            style={{ 
              fontFamily: 'Impact, fantasy', 
              color: '#f5f3ff', 
              textDecoration: 'underline', 
              textDecorationColor: '#38bdf8',
              textUnderlineOffset: '8px',
              textDecorationThickness: '3px'
            }} 
            className="text-3xl md:text-4xl font-black italic uppercase leading-tight drop-shadow-[0_0_18px_rgba(139,92,246,0.28)] tracking-wide"
          >
            "tell the world that i am here"
          </h2>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-[2rem] border border-violet-300/20 flex flex-col md:flex-row items-center gap-7 md:gap-10 shadow-2xl shadow-violet-950/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
          <Crown size={180} />
        </div>
        <div className="relative">
          <img src={profile.avatar} className={`w-40 h-40 rounded-full border-4 p-1.5 transition-all duration-500 ${profile.activeDecoration ? 'border-primary shadow-[0_0_30px_var(--primary)]' : 'border-primary/20'}`} alt="User" />
          {profile.activePlugin && <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-3 rounded-2xl shadow-2xl animate-bounce border-2 border-black"><Zap size={20} /></div>}
        </div>
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tight">{profile.name}</h3>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
              <span className="text-primary font-black uppercase tracking-widest text-[10px]">Rank {profile.rank}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{profile.team}</span>
            </div>
          </div>

          <div className="pt-2 max-w-sm mx-auto md:mx-0">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              <span>XP Progress</span>
              <span className="text-primary">{Math.floor(xpPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_var(--primary)]" 
                style={{ width: `${xpPercentage}%` }} 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 inline-block">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Account Balance</p>
                <h5 className="text-4xl font-black text-white uppercase">{profile.balance.toFixed(2)} <span className="text-xs text-primary">M3GA</span></h5>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => onPanelChange(PanelType.ARENA)} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20">
                  <Swords size={14} /> ENTER ENCARTO ARENA (PRACTICE)
                </button>
                <button onClick={onWalletTab} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                  <Plus size={14} /> DEPOSIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Hall of Fame */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="anime-title text-xl sm:text-2xl uppercase flex items-center gap-3"><Medal size={20} className="text-yellow-500" /> Current Sovereigns</h4>
          <button onClick={() => onPanelChange(PanelType.HALL_OF_FAME)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">Full Gallery <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3HOF.map((winner, idx) => (
            <div key={idx} className={`glass-panel p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${idx === 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-primary/20 text-primary'}`}>
                  {idx + 1}
                </div>
                <div>
                  <h5 className="text-sm font-black text-white uppercase">{winner.winnerName}</h5>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Rank {winner.rankAtWin} Champion</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Crowned At</p>
                <p className="text-[10px] font-bold text-white uppercase truncate">{winner.tournamentName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tournaments & Fixtures Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><Trophy size={20} className="text-yellow-500" /> Upcoming Seasons</h4>
            <button onClick={() => onPanelChange(PanelType.TOURNAMENTS)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">See All <ChevronRight size={12} /></button>
          </div>
          <div className="grid gap-4">
            {upcomingTournaments.slice(0, 2).map(t => (
              <div key={t.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:border-primary/40 transition-all group cursor-pointer" onClick={() => onPanelChange(PanelType.TOURNAMENTS)}>
                <div>
                  <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">{t.game}</span>
                  <h5 className="text-lg font-black text-white uppercase mt-2">{t.name}</h5>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-yellow-500 uppercase">{t.prize}</p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><Swords size={20} className="text-red-500" /> Active Slate</h4>
            <button onClick={() => onPanelChange(PanelType.FIXTURES)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">Brackets <ChevronRight size={12} /></button>
          </div>
          <div className="grid gap-4">
            {latestFixtures.map(f => (
              <div key={f.id} className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 hover:border-red-500/20 transition-all cursor-pointer" onClick={() => onPanelChange(PanelType.FIXTURES)}>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{f.tournamentName}</span>
                  <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase">
                    <Clock size={10} /> {f.time}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black text-white uppercase truncate flex-1 text-right">{f.teamA}</span>
                  <div className="p-2 bg-white/5 rounded-lg text-gray-600 text-[8px] font-black italic">VS</div>
                  <span className="text-xs font-black text-white uppercase truncate flex-1">{f.teamB}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Blogs & Streams Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><Newspaper size={20} className="text-primary" /> The Signal</h4>
            <button onClick={() => onPanelChange(PanelType.BLOG)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">Feed <ChevronRight size={12} /></button>
          </div>
          <div className="grid gap-4">
            {latestBlogs.map(post => (
              <div key={post.id} className="glass-panel p-4 rounded-3xl border border-white/5 flex gap-4 hover:border-primary/40 transition-all group cursor-pointer" onClick={() => onPanelChange(PanelType.BLOG)}>
                <img src={post.image} className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="Blog" />
                <div className="flex-grow min-w-0 flex flex-col justify-center">
                  <h5 className="text-sm font-black text-white uppercase truncate mb-1">{post.title}</h5>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><MonitorPlay size={20} className="text-purple-500" /> Arena Streams</h4>
            <button onClick={() => onPanelChange(PanelType.STREAMING)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">Watch <ChevronRight size={12} /></button>
          </div>
          <div className="grid gap-4">
            {liveStreams.map(stream => (
              <div key={stream.id} className="glass-panel p-4 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-purple-500/30 transition-all group cursor-pointer" onClick={() => onPanelChange(PanelType.STREAMING)}>
                <div className="relative">
                  <img src={stream.thumbnail} className="w-16 h-12 rounded-xl object-cover" alt="Stream" />
                  <div className="absolute -top-1 -left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[6px] font-black animate-pulse">LIVE</div>
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase truncate">{stream.title}</h5>
                  <p className="text-[8px] font-bold text-gray-500 uppercase mt-1 flex items-center gap-1">
                    <Radio size={8} /> {stream.streamer} • {stream.viewers} watching
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Merch Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><ShoppingBag size={20} className="text-yellow-500" /> Featured Gear</h4>
          <button onClick={() => onPanelChange(PanelType.STORE)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">Full Armory <ChevronRight size={12} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMerch.map(item => (
            <div key={item.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/20 transition-all group flex flex-col">
              <div className="w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center mb-4 overflow-hidden relative">
                <ShoppingBag size={48} className="text-gray-700 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <h5 className="text-sm font-black text-white uppercase mb-2">{item.name}</h5>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-black text-white">{item.price} <span className="text-[10px] text-primary uppercase tracking-widest">m3ga</span></span>
                <button onClick={() => onPanelChange(PanelType.STORE)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Inspect</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Center (Previously visible, keeping for continuity) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><Users size={20} className="text-blue-500" /> Squad Center</h4>
        </div>
        {myTeam ? (
          <div className="glass-panel p-8 rounded-[3rem] border border-primary/20 flex items-center gap-6 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer" onClick={() => onPanelChange(PanelType.TEAMS)}>
            <img src={myTeam.image} className="w-20 h-20 rounded-3xl object-cover border-2 border-primary/20 shadow-xl" alt="Squad" />
            <div>
              <h5 className="text-xl font-black text-white uppercase">{myTeam.name}</h5>
              <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{myTeam.memberCount} Battle-Ready Members • {profile.isLeader ? 'Leader' : 'Member'}</p>
            </div>
            <div className="ml-auto p-4 bg-white/5 rounded-2xl text-primary">
               <ChevronRight size={24} />
            </div>
          </div>
        ) : (
          <div className="glass-panel p-10 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center text-center">
            <Users className="text-gray-800 mb-4" size={48} />
            <p className="text-xs font-black text-gray-600 uppercase mb-6 tracking-widest">You currently operate as a Ronin (No Squad)</p>
            <button onClick={() => onPanelChange(PanelType.TEAMS)} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Enlist in a Squad</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default LobbyPanel;
