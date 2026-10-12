
import React, { useState } from 'react';
import { 
  Sparkles, 
  Swords, 
  Zap, 
  Quote, 
  Gamepad2, 
  Rocket, 
  ArrowRight, 
  Trophy, 
  Newspaper, 
  Clock, 
  ShieldCheck,
  MessageSquare,
  Laugh,
  ShieldAlert
} from 'lucide-react';
import { BLOG_POSTS, UPCOMING_TOURNAMENTS, MATCH_FIXTURES } from './mockData.ts';
import { LogoComponent } from './components.tsx';

interface LandingPanelProps {
  onEnter: () => void;
  onAdminAccess: () => void;
}

const LandingPanel: React.FC<LandingPanelProps> = ({ onEnter, onAdminAccess }) => {
  const [secretCounter, setSecretCounter] = useState(0);

  const handleSecretClick = () => {
    setSecretCounter(prev => prev + 1);
  };

  const PULSE_CARDS = [
    { type: 'joke', content: "Why did the gamer go to the doctor? He had a severe case of 'Low FPS'—Frequent Pointless Shouting.", icon: <Laugh className="text-yellow-500" /> },
    { type: 'quote', content: "Wake up to reality! Nothing ever goes as planned in this world.", author: "Madara Uchiha", icon: <Quote className="text-red-500" /> },
    { type: 'quote', content: "A famous explorer once said, that the extraordinary is in what we do, not who we are.", author: "Lara Croft", icon: <Trophy className="text-primary" /> },
    { type: 'quote', content: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy", icon: <ShieldCheck className="text-blue-500" /> },
    { type: 'joke', content: "What do you call a gamer who just broke up with their partner? Single Player Mode.", icon: <MessageSquare className="text-purple-500" /> },
    { type: 'quote', content: "Go Beyond! Plus Ultra!", author: "All Might", icon: <Trophy className="text-yellow-400" /> },
    { type: 'info', content: "Rank 15 is more than a number; it's a verification of your digital legacy.", icon: <Sparkles className="text-green-500" /> },
    { type: 'quote', content: "Surpass your limits. Right here, right now.", author: "Yami Sukehiro", icon: <Swords className="text-orange-500" /> },
    { type: 'joke', content: "Why can't gamers find their keys? Because there are too many loot boxes in the way!", icon: <Gamepad2 className="text-pink-500" /> },
    { type: 'quote', content: "I never go back on my word... that's my ninja way!", author: "Naruto Uzumaki", icon: <Rocket className="text-orange-600" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-y-auto no-scrollbar pb-24">
      {/* Hero Header */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-center gap-4 mb-4">
             <LogoComponent className="w-16 h-16" />
             <h1 className="anime-title text-5xl md:text-7xl tracking-tighter uppercase">ENCARTO</h1>
          </div>
          
          <div className="inline-block relative">
            <h2 
              style={{ 
                fontFamily: 'Impact, fantasy', 
                color: 'black', 
                textDecoration: 'underline', 
                textDecorationColor: '#00f2ff',
                textUnderlineOffset: '8px',
                textDecorationThickness: '3px'
              }} 
              className="text-3xl md:text-4xl font-black italic uppercase leading-tight drop-shadow-[0_0_8px_rgba(0,242,255,0.4)] tracking-wide max-w-5xl mx-auto"
            >
              "tell the world that i am here"
            </h2>
          </div>

          <div className="space-y-8 pt-8">
            <p className="text-gray-500 text-xs md:text-sm font-black uppercase tracking-[0.6em] max-w-2xl mx-auto">
              THE GLOBAL COMMAND CENTER FOR PRO GAMERS
            </p>
            <button 
              onClick={onEnter}
              className="group px-12 py-6 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
            >
              ENTER THE ARENA <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* The Pulse Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-10">
        <div className="flex items-center gap-4">
          <Zap className="text-primary animate-pulse" size={24} />
          <h3 className="anime-title text-3xl uppercase tracking-widest">The Global Pulse</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PULSE_CARDS.map((card, i) => (
            <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between hover:border-primary/40 transition-all group min-h-[220px]">
              <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform">{card.icon}</div>
              <div className="space-y-3">
                <p className="text-xs font-bold leading-relaxed text-gray-300">"{card.content}"</p>
                {card.author && <p className="text-[9px] font-black text-primary uppercase tracking-widest">— {card.author}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Arena Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-3 gap-12 border-t border-white/5">
        
        {/* Latest Blog */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="anime-title text-xl uppercase flex items-center gap-2"><Newspaper size={18} className="text-primary"/> Signal Feed</h4>
            <button onClick={onEnter} className="text-[10px] font-black text-gray-500 hover:text-white uppercase">More</button>
          </div>
          <div className="space-y-4">
            {BLOG_POSTS.slice(0, 2).map(post => (
              <div key={post.id} className="glass-panel p-5 rounded-3xl border border-white/5 flex gap-4 group cursor-pointer" onClick={onEnter}>
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                  <img src={post.image} className="w-full h-full object-cover" alt="Blog" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-black uppercase truncate group-hover:text-primary transition-colors">{post.title}</h5>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournaments */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="anime-title text-xl uppercase flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> Arena Seasons</h4>
            <button onClick={onEnter} className="text-[10px] font-black text-gray-500 hover:text-white uppercase">Join</button>
          </div>
          <div className="space-y-4">
            {UPCOMING_TOURNAMENTS.slice(0, 2).map(t => (
              <div key={t.id} className="glass-panel p-5 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer" onClick={onEnter}>
                <div>
                  <h5 className="text-sm font-black uppercase group-hover:text-primary transition-colors">{t.name}</h5>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">{t.game}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-yellow-500">{t.prize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixtures */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="anime-title text-xl uppercase flex items-center gap-2"><Swords size={18} className="text-red-500"/> Live Brackets</h4>
            <button onClick={onEnter} className="text-[10px] font-black text-gray-500 hover:text-white uppercase">Live</button>
          </div>
          <div className="space-y-4">
            {MATCH_FIXTURES.slice(0, 2).map(f => (
              <div key={f.id} className="glass-panel p-5 rounded-3xl border border-white/5 space-y-2 group cursor-pointer" onClick={onEnter}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-black uppercase truncate flex-1 text-right">{f.teamA}</span>
                  <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-gray-500 italic">VS</div>
                  <span className="text-[10px] font-black uppercase truncate flex-1">{f.teamB}</span>
                </div>
                <div className="flex justify-center items-center gap-2 text-[8px] font-black text-primary uppercase">
                  <Clock size={10} /> {f.time} • {f.tournamentName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Revolution Manifesto */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center space-y-12">
        <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-full border border-primary/20 mb-4 animate-bounce">
          <Rocket className="text-primary" size={48} />
        </div>
        <h3 className="anime-title text-6xl uppercase tracking-tighter">The Gaming Revolution</h3>
        <div className="space-y-8">
          <p className="text-2xl text-gray-400 font-medium leading-relaxed italic px-4">
            "Encarto is more than a platform. It's a sanctuary for the competitive spirit. We are redefining the relationship between player and achievement."
          </p>
          <div className="max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto font-medium">
            By leveraging cutting-edge AI-driven insights and decentralized wagering, we turn your split-second reactions and tactical mastery into a verifiable legacy. We don't just host games; we broadcast the evolution of skill.
          </p>
        </div>
        <button 
          onClick={onEnter}
          className="mt-8 px-16 py-6 bg-white text-black rounded-[2rem] font-black text-[14px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          CLAIM YOUR RANK NOW
        </button>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5 text-center relative">
         <div className="flex items-center justify-center gap-2 opacity-30 grayscale select-none">
           <LogoComponent className="w-6 h-6" />
           <span className="anime-title text-sm tracking-widest">
             ENCARTO LABS // <span 
               onClick={handleSecretClick}
               className="cursor-default active:text-white transition-colors"
             >2025</span>
           </span>
         </div>
         {secretCounter >= 5 && (
           <div className="mt-8 flex justify-center animate-bounce">
              <button 
                onClick={onAdminAccess}
                className="p-4 bg-red-600/20 text-red-600 rounded-full border border-red-600/50 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                <ShieldAlert size={24} />
              </button>
           </div>
         )}
      </footer>
    </div>
  );
};

export default LandingPanel;
