import React from 'react';
import { ENCARTO_TEMPLATES, ENCARTO_ASSETS } from '../utils/constants.ts';
import { EncartoTemplate, CanvasItem } from '../types.ts';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import { soundManager } from '../utils/sound.ts';

interface EnchantedRoomsViewProps {
  onApplyTemplate: (items: CanvasItem[]) => void;
  onOpenCanvas: () => void;
}

export const EnchantedRoomsView: React.FC<EnchantedRoomsViewProps> = ({
  onApplyTemplate,
  onOpenCanvas,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 sm:p-10 flex flex-col items-center z-10 relative">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.25)] min-h-[220px] flex flex-col justify-end p-6 sm:p-8">
          <img
            src={ENCARTO_ASSETS.aurora}
            alt="Encarto Aurora"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070514] via-[#070514]/60 to-transparent" />

          <div className="relative z-10 flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40">
                Enchanted Chambers
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              Choose an Enchanted Portal
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed drop-shadow">
              Step through one of the glowing doorways to instantly awaken a curated constellation of vision cards, luminous tasks, and strategic layouts.
            </p>
          </div>
        </div>

        {/* Room Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ENCARTO_TEMPLATES.map((room) => {
            const isCyan = room.accent === 'cyan';
            const isGold = room.accent === 'gold';

            return (
              <div
                key={room.id}
                className="group relative rounded-2xl bg-[#0f0a28]/80 backdrop-blur-xl border border-purple-500/30 p-5 flex flex-col justify-between hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-all duration-300"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                      {room.icon}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isCyan
                          ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                          : isGold
                          ? 'border-amber-500/40 text-amber-300 bg-amber-950/40'
                          : 'border-purple-500/40 text-purple-300 bg-purple-950/40'
                      }`}
                    >
                      {room.items.length} Elements
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-xs text-purple-300/80 font-medium mt-0.5">
                      {room.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="pt-5 mt-3 border-t border-purple-500/15 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onApplyTemplate(room.items);
                      soundManager.playChime('complete');
                      onOpenCanvas();
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isCyan
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isGold
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-purple-600/30 text-purple-200 border border-purple-500/50 hover:bg-purple-600/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Awaken Room</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Showcase Card with Doorway */}
        <div className="rounded-2xl border border-purple-500/25 bg-[#0b081e]/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 ring-1 ring-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <img
              src={ENCARTO_ASSETS.doorway}
              alt="Encarto Doorway"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">
              Every Idea Has Its Own Magical Doorway
            </h4>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              In Encarto, your canvas is never static. Switch seamlessly between infinite freeform cards, deep Grimoire document writing, and rapid scratchpad thought capture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
