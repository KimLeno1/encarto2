import React from 'react';
import { LayoutDashboard, FileText, StickyNote, Sparkles } from 'lucide-react';
import { WorkspaceMode } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface MobileBottomNavProps {
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ mode, onModeChange }) => {
  const tabs = [
    { id: 'canvas', label: 'Canvas', icon: LayoutDashboard, chime: 'mid' as const, accent: 'text-purple-400' },
    { id: 'document', label: 'Grimoire', icon: FileText, chime: 'high' as const, accent: 'text-cyan-400' },
    { id: 'scratchpad', label: 'Scratchpad', icon: StickyNote, chime: 'mid' as const, accent: 'text-purple-300' },
    { id: 'templates', label: 'Rooms', icon: Sparkles, chime: 'complete' as const, accent: 'text-amber-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0718]/95 backdrop-blur-xl border-t border-purple-500/25 h-16 px-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(10,5,30,0.8)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onModeChange(tab.id as WorkspaceMode);
              soundManager.playChime(tab.chime);
            }}
            className={`min-h-[48px] min-w-[64px] flex flex-col items-center justify-center transition-all ${
              isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive
                  ? tab.id === 'document'
                    ? 'bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                    : tab.id === 'templates'
                    ? 'bg-amber-950/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : 'bg-purple-950/80 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                  : 'text-zinc-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                isActive ? tab.accent : 'text-zinc-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
