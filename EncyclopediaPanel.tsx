
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Volume2, Share2, ArrowRight, Loader2, Play } from 'lucide-react';
import { getEncyclopediaEntry, generateTopicImage, generateSpeech, decodePCM } from './geminiService';
import { ArticleData } from './types';
import { SectionLoader } from './components';

const EncyclopediaPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setArticle(null);
    setCoverImage(null);

    try {
      const [entryData, imageData] = await Promise.all([
        getEncyclopediaEntry(query),
        generateTopicImage(query)
      ]);
      setArticle(entryData);
      setCoverImage(imageData);
    } catch (error) {
      console.error("Discovery failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!article || isSpeaking) return;
    setIsSpeaking(true);

    try {
      const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) setAudioCtx(ctx);

      const pcmData = await generateSpeech(article.summary);
      const buffer = await decodePCM(pcmData, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (error) {
      console.error("Narration failed:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <header className="text-center space-y-4">
        <h2 className="anime-title text-6xl text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Encarto Discovery</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">The Sum of All Gaming Knowledge</p>
      </header>

      <div className="relative group max-w-2xl mx-auto">
        <form onSubmit={handleSearch}>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Search for lore, games, or strategy..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[3rem] py-8 pl-16 pr-24 text-lg font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-4 rounded-full shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
          </button>
        </form>
      </div>

      {isLoading ? (
        <SectionLoader message="Synthesizing Knowledge Hub..." />
      ) : article ? (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <div className="glass-panel rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
            {coverImage && (
              <div className="h-96 relative">
                <img src={coverImage} className="w-full h-full object-cover" alt="Discovery" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h1 className="text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{article.title}</h1>
                </div>
              </div>
            )}

            <div className="p-12 space-y-12">
              <section className="relative">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                    <BookOpen size={14}/> Abstract
                  </h4>
                  <button 
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all ${isSpeaking ? 'bg-primary text-white border-primary animate-pulse' : 'hover:bg-white/5 text-gray-400'}`}
                  >
                    <Volume2 size={16} /> {isSpeaking ? 'Narrating...' : 'Listen'}
                  </button>
                </div>
                <p className="text-xl text-gray-300 leading-relaxed font-medium italic opacity-90 border-l-4 border-primary/20 pl-8">
                  {article.summary}
                </p>
              </section>

              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                  {article.sections.map((sec, i) => (
                    <article key={i} className="space-y-4">
                      <h5 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="text-primary opacity-50">0{i+1}.</span> {sec.heading}
                      </h5>
                      <p className="text-gray-400 leading-relaxed font-medium">{sec.content}</p>
                    </article>
                  ))}
                </div>

                <aside className="lg:col-span-4 space-y-8">
                  <div className="glass-panel p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                    <h6 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Related Nodes</h6>
                    <div className="space-y-3">
                      {article.relatedTopics.map(topic => (
                        <button 
                          key={topic} 
                          onClick={() => { setQuery(topic); handleSearch(); }}
                          className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white uppercase hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                        >
                          {topic} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-[2rem] border border-white/5">
                    <h6 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Deep Dive Queries</h6>
                    <ul className="space-y-4">
                      {article.suggestedPrompts.map((p, i) => (
                        <li key={i} className="text-[10px] font-bold text-gray-400 leading-relaxed hover:text-primary cursor-pointer transition-colors">• {p}</li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <Sparkles className="mx-auto text-gray-800 mb-6 animate-pulse" size={64} />
          <p className="text-gray-600 font-black uppercase text-xs tracking-[0.3em]">Knowledge base idling. Initiate query.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Genshin Lore', 'Elden Ring Bosses', 'Anime History', 'Encarto Meta'].map(tag => (
              <button 
                key={tag}
                onClick={() => { setQuery(tag); }}
                className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black text-gray-500 uppercase hover:text-white hover:border-primary/40 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EncyclopediaPanel;
