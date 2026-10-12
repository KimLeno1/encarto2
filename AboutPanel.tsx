
import React from 'react';
import { Sparkles, Swords, Zap, Quote, Gamepad2, Rocket } from 'lucide-react';

const AboutPanel: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in duration-700 pb-24">
      {/* Hero Motto Section */}
      <section className="text-center space-y-8 pt-12">
        <h2 className="anime-title text-6xl md:text-8xl text-white tracking-[0.2em] uppercase leading-tight drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
          "tell the world that i am here"
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xl text-gray-400 font-medium leading-relaxed italic border-l-4 border-primary/40 pl-8 text-left">
            You aren't just another user ID. You aren't just a stat on a leaderboard. Every button press, every split-second reaction, every calculated wager—it's your voice screaming into the digital void. 
          </p>
          <p className="text-lg text-white font-black uppercase tracking-widest text-right">
            Encarto is your stage. The arena is waiting. Motivate yourself, surpass your limits, and make them remember your name.
          </p>
        </div>
      </section>

      {/* Revolution & Features */}
      <section className="grid md:grid-cols-2 gap-12">
        <div className="glass-panel p-10 rounded-[3rem] border border-white/10 space-y-6">
          <div className="p-4 bg-primary/20 rounded-2xl w-fit text-primary shadow-lg shadow-primary/20">
            <Rocket size={32} />
          </div>
          <h3 className="anime-title text-3xl text-white uppercase tracking-tight">The Revolution</h3>
          <p className="text-gray-400 leading-relaxed font-medium">
            Encarto isn't just a gaming hub; it's a high-stakes ecosystem. We've bridged the gap between casual play and professional betting. By integrating cutting-edge AI discovery and P2P wagering, we've created a platform where skill directly translates to legacy and capital.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2">Core Systems</h4>
          {[
            { icon: <Swords size={18}/>, title: "Skill Duels", desc: "Stake M3GA in verified 1v1 matches with 80% winner payouts." },
            { icon: <Zap size={18}/>, title: "AI Discovery", desc: "Real-time gaming knowledge synthesized by the Gemini engine." },
            { icon: <Gamepad2 size={18}/>, title: "Cross-Game Ranking", desc: "Unified ranking system from Rank 1 to the legendary Rank 15." }
          ].map((feat, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-6 hover:bg-white/5 transition-all group">
              <div className="text-primary group-hover:scale-110 transition-transform">{feat.icon}</div>
              <div>
                <h5 className="text-sm font-black text-white uppercase">{feat.title}</h5>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gaming Jokes Section */}
      <section className="glass-panel p-12 rounded-[3rem] border border-white/10 relative overflow-hidden text-center space-y-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <h3 className="anime-title text-3xl text-white uppercase tracking-widest flex items-center justify-center gap-4">
          <Sparkles className="text-yellow-500" /> The Loading Screen Lounge <Sparkles className="text-yellow-500" />
        </h3>
        <div className="grid md:grid-cols-2 gap-8 italic">
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
            <p className="text-gray-300">"Why did the gamer go to the doctor? Because he had a severe case of 'Low FPS'—Frequent Pointless Shouting."</p>
          </div>
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
            <p className="text-gray-300">"What do you call a gamer who just broke up with their partner? Single Player Mode."</p>
          </div>
        </div>
      </section>

      {/* Badass Anime Quotes */}
      <section className="space-y-10">
        <div className="flex items-center gap-4 px-2">
          <Quote className="text-primary" size={24} />
          <h4 className="anime-title text-2xl text-white uppercase">The Hall of Souls</h4>
        </div>
        <div className="grid gap-6">
          {[
            { quote: "Wake up to reality! Nothing ever goes as planned in this world.", author: "Madara Uchiha", anime: "Naruto" },
            { quote: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy", anime: "One Piece" },
            { quote: "Surpass your limits. Right here, right now.", author: "Yami Sukehiro", anime: "Black Clover" }
          ].map((q, i) => (
            <div key={i} className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-gradient-to-r from-primary/5 to-transparent relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
              <p className="text-2xl font-black text-white uppercase tracking-tight mb-3">"{q.quote}"</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">— {q.author}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{q.anime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPanel;
