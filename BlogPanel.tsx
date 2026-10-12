
import React, { useState, useMemo } from 'react';
import { Search, Calendar, User, Clock, ChevronRight, Tag, Share2, MessageCircle, Newspaper, Sparkles, TrendingUp, ShoppingCart } from 'lucide-react';
import { BlogPost } from './types';

interface BlogPanelProps {
  posts: BlogPost[];
}

const BlogPanel: React.FC<BlogPanelProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const filteredPosts = useMemo(() => {
    return [...posts]
      .filter(p => !searchQuery.trim() || `${p.title} ${p.excerpt} ${p.category} ${p.author}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, searchQuery]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  const SponsoredAd = () => (
    <div className="glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-primary/20 via-black to-black border-2 border-primary/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShoppingCart size={200} />
      </div>
      <div className="relative z-10 space-y-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary text-white text-[8px] font-black rounded uppercase tracking-[0.3em]">Sponsored</span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Encarto Market</span>
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Level Up Your Identity</h3>
        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-lg">Get the Neon Plasma Border and a Golden Aura for 15% off this weekend only. Limited to Rank 10+ veterans.</p>
        <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Go to Armory</button>
      </div>
      <div className="hidden lg:block w-48 h-48 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse" />
        <TrendingUp size={80} className="text-primary" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24 px-4">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="anime-title text-6xl text-white uppercase tracking-tight">The Signal</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <Newspaper size={14} className="text-primary" /> Transmissions from the Global Hub
          </p>
        </div>
        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search Transmissions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </header>

      {/* Featured Ad */}
      <SponsoredAd />

      {/* Featured Post */}
      {!searchQuery && featuredPost && (
        <section onClick={() => setActivePost(featuredPost)} className="glass-panel rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl relative group cursor-pointer hover:border-primary/40 transition-all duration-500">
          <div className="grid lg:grid-cols-2">
            <div className="h-80 lg:h-auto relative overflow-hidden">
              <img src={featuredPost.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
            <div className="p-10 lg:p-16 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary/20 text-primary text-[8px] font-black rounded uppercase tracking-widest">{featuredPost.category}</span>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{featuredPost.date}</span>
              </div>
              <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9]">{featuredPost.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed line-clamp-3">{featuredPost.excerpt}</p>
              <div className="pt-6 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-black text-primary text-xs italic">
                    {featuredPost.author.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase">{featuredPost.author}</span>
                    <span className="text-[8px] font-black text-gray-600 uppercase">Senior Analyst</span>
                  </div>
                </div>
                <span className="p-4 bg-primary text-white rounded-full shadow-xl shadow-primary/20">
                  <ChevronRight size={24} />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid Posts */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gridPosts.map((post, idx) => (
          <button type="button" key={post.id} onClick={() => setActivePost(post)} className="text-left glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col group hover:border-primary/30 transition-all">
            <div className="h-56 relative overflow-hidden">
              <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Blog" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                {post.category}
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow space-y-4">
              <div className="flex items-center gap-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                <Clock size={10} /> {post.date}
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {post.title}
              </h4>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-3 mb-6">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase italic">By {post.author}</span>
                <div className="flex items-center gap-4 text-gray-600">
                  <Share2 size={16} className="hover:text-white transition-colors cursor-pointer" />
                  <MessageCircle size={16} className="hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Dynamic Ad Placement within Grid */}
        <div className="glass-panel rounded-[2.5rem] border border-dashed border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-6 bg-primary/5">
          <div className="p-6 bg-primary/10 rounded-full text-primary">
            <Sparkles size={48} className="animate-pulse" />
          </div>
          <div>
            <h5 className="text-lg font-black text-white uppercase tracking-tight">Support The Signal</h5>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mt-2">Get ad-free transmissions and exclusive blog emotes by joining the Inner Circle.</p>
          </div>
          <button className="w-full py-4 border border-primary/40 text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">Become a Patron</button>
        </div>
      </section>

      {activePost && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={activePost.title} onClick={() => setActivePost(null)}>
          <article className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-violet-300/20 bg-[#0b0b19] shadow-2xl" onClick={event => event.stopPropagation()}>
            <img src={activePost.image} alt="" className="h-56 w-full object-cover sm:h-72" />
            <div className="space-y-5 p-6 sm:p-9">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-sky-200"><span>{activePost.category}</span><span className="text-slate-600">•</span><span>{activePost.date}</span><span className="text-slate-600">•</span><span>By {activePost.author}</span></div>
              <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{activePost.title}</h3>
              <p className="text-sm leading-7 text-slate-300">{activePost.excerpt}</p>
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-400">{activePost.content}</div>
              <button type="button" onClick={() => setActivePost(null)} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5">Close article</button>
            </div>
          </article>
        </div>
      )}
      {filteredPosts.length === 0 && (
        <div className="py-32 text-center glass-panel rounded-[3rem] border-dashed border-white/10">
          <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-gray-800" />
          </div>
          <p className="text-gray-600 font-black uppercase text-xs tracking-[0.4em]">No signal found for: "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default BlogPanel;
