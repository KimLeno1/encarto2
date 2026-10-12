
import React, { useMemo } from 'react';
import { Play, Users, Calendar, Radio, Share2, MoreHorizontal, Zap, ShoppingCart, Trophy, ShoppingBag } from 'lucide-react';
import { Stream } from './types';

interface StreamingPanelProps {
  streams: Stream[];
}

const StreamingPanel: React.FC<StreamingPanelProps> = ({ streams }) => {
  const sortedStreams = useMemo(() => {
    return [...streams].sort((a, b) => {
      // Live streams first
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      // Then by date latest to oldest
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  }, [streams]);

  const liveStreams = sortedStreams.filter(s => s.isLive);
  const pastStreams = sortedStreams.filter(s => !s.isLive);

  const FeaturedAd = () => (
    <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-600/20 to-transparent border-2 border-orange-600/10 flex items-center justify-between gap-8 mb-12 group hover:border-orange-600/30 transition-all">
      <div className="space-y-4 max-w-lg">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-orange-600 text-white text-[8px] font-black rounded uppercase tracking-widest">Sponsored</span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Exclusive Gear</span>
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">The Encarto Elite Hoodie</h3>
        <p className="text-gray-400 text-sm font-medium">Equip yourself with the official 2025 Arena gear. Limited supply available in the Armory.</p>
        <button className="px-8 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/20">
          <ShoppingCart size={14} /> Shop Now
        </button>
      </div>
      <div className="hidden lg:block relative">
        <div className="w-48 h-48 bg-white/5 rounded-full blur-3xl absolute inset-0 animate-pulse" />
        <ShoppingBag className="text-orange-600/50 w-32 h-32 relative animate-bounce" />
      </div>
    </div>
  );

  const ArenaAd = () => (
    <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-black to-black border border-primary/20 flex flex-col items-center text-center space-y-4">
      <Trophy size={48} className="text-primary animate-pulse" />
      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Grand Line Clash</h4>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registrations Closing in 2h</p>
      <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
        Enter Arena
      </button>
    </div>
  );

  const StreamCard = ({ stream }: { stream: Stream; key?: any }) => (
    <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden group hover:border-primary/40 transition-all flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img src={stream.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stream.title} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
        {stream.isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-widest animate-pulse">
            <Radio size={10} /> Live Now
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black rounded uppercase">
          <Users size={10} /> {stream.viewers}
        </div>
      </div>
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-sm font-black text-white uppercase tracking-tight line-clamp-2 leading-tight">{stream.title}</h4>
          <button className="text-gray-600 hover:text-white transition-colors"><MoreHorizontal size={18}/></button>
        </div>
        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20">
              {stream.streamer.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase">{stream.streamer}</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase">{stream.game}</span>
            </div>
          </div>
          {!stream.isLive && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar size={10}/>
              <span className="text-[8px] font-black uppercase tracking-widest">{new Date(stream.startTime).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">Stream Hub</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Witness the legacy. Broadcast the legend.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">All Streams</button>
            <button className="px-6 py-2.5 text-gray-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Watching</button>
          </div>
        </div>
      </header>

      <FeaturedAd />

      {liveStreams.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <Radio className="text-red-600 animate-pulse" size={24} />
            <h3 className="anime-title text-2xl text-white uppercase">Live Broadcasts</h3>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{liveStreams.length} Channels Active</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {liveStreams.map(s => <StreamCard key={s.id} stream={s} />)}
          </div>
        </section>
      )}

      <section className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-9 space-y-12">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <Zap className="text-primary" size={24} />
              <h3 className="anime-title text-2xl text-white uppercase">Recent Replays</h3>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastStreams.map(s => <StreamCard key={s.id} stream={s} />)}
          </div>
        </div>

        <aside className="lg:col-span-3 space-y-8">
          <div className="sticky top-32 space-y-8">
            <ArenaAd />
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Trending Games</h4>
              <div className="space-y-4">
                {['MHA: Ultra Rumble', 'One Piece Clash', 'Shinobi Striker', 'PvP Chess'].map((game, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-black text-white uppercase group-hover:text-primary transition-colors">{game}</span>
                    <span className="text-[8px] font-black text-gray-600 uppercase">{Math.floor(Math.random() * 20 + 5)}k Watching</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default StreamingPanel;
