import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  StickyNote,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Trash2,
  Download,
  Grid,
  CircleDot,
  Minus,
  Square,
  Smartphone,
  Monitor,
  Flame,
} from 'lucide-react';
import { WorkspaceMode, CanvasBackground, DeviceModeSetting, ActiveDevice } from '../types.ts';
import { ENCARTO_ASSETS } from '../utils/constants.ts';
import { soundManager } from '../utils/sound.ts';

interface DesktopNavbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  background: CanvasBackground;
  onBackgroundChange: (bg: CanvasBackground) => void;
  deviceSetting: DeviceModeSetting;
  onDeviceSettingChange: (setting: DeviceModeSetting) => void;
  activeDevice: ActiveDevice;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onClear: () => void;
  onExport: () => void;
}

export const DesktopNavbar: React.FC<DesktopNavbarProps> = ({
  title,
  onTitleChange,
  mode,
  onModeChange,
  background,
  onBackgroundChange,
  deviceSetting,
  onDeviceSettingChange,
  activeDevice,
  soundEnabled,
  onToggleSound,
  isZenMode,
  onToggleZenMode,
  onClear,
  onExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-15 border-b border-purple-500/20 bg-[#0d0920]/80 backdrop-blur-xl px-5 flex items-center justify-between shrink-0 select-none z-30 transition-colors shadow-[0_4px_30px_rgba(10,5,30,0.6)]">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950">
            <img
              src={ENCARTO_ASSETS.candle}
              alt="Encarto Miracle Candle"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-200 to-cyan-400 text-base tracking-tight drop-shadow-sm font-sans">
            Encarto
          </span>
        </div>

        <div className="h-4 w-px bg-purple-500/25 hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-950/70 text-cyan-200 border border-purple-500/50 outline-none w-52 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            />
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              title="Click to rename"
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-purple-950/40 text-xs font-medium text-zinc-300 hover:text-cyan-200 border border-transparent hover:border-purple-500/30 transition-all"
            >
              <span className="truncate max-w-[180px]">{title}</span>
              <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                ✎
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Mode Tabs */}
      <div className="flex items-center bg-[#070514]/90 p-1 rounded-xl border border-purple-500/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => {
            onModeChange('canvas');
            soundManager.playChime('mid');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'canvas'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.5)]'
              : 'text-zinc-400 hover:text-purple-200 hover:bg-purple-950/30'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => {
            onModeChange('document');
            soundManager.playChime('high');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'document'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.5)]'
              : 'text-zinc-400 hover:text-cyan-200 hover:bg-cyan-950/30'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Grimoire Doc</span>
        </button>

        <button
          onClick={() => {
            onModeChange('scratchpad');
            soundManager.playChime('mid');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'scratchpad'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.4)]'
              : 'text-zinc-400 hover:text-purple-200 hover:bg-purple-950/30'
          }`}
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span>Scratchpad</span>
        </button>

        <button
          onClick={() => {
            onModeChange('templates');
            soundManager.playChime('complete');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'templates'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-[0_0_18px_rgba(245,158,11,0.5)]'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-amber-950/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Enchanted Rooms</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Device Mode Switcher (Auto / Desktop / Mobile) */}
        <div className="flex items-center bg-[#070514]/80 p-0.5 rounded-lg border border-purple-500/25">
          <button
            onClick={() => onDeviceSettingChange('auto')}
            title="Auto detect viewport"
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              deviceSetting === 'auto'
                ? 'bg-purple-600/80 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Auto ({activeDevice === 'mobile' ? 'Mobile' : 'Desktop'})
          </button>
          <button
            onClick={() => onDeviceSettingChange('desktop')}
            title="Force Desktop Layout"
            className={`p-1 rounded text-xs transition-all ${
              deviceSetting === 'desktop'
                ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeviceSettingChange('mobile')}
            title="Force Mobile Layout"
            className={`p-1 rounded text-xs transition-all ${
              deviceSetting === 'mobile'
                ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas Background Patterns */}
        {mode === 'canvas' && (
          <div className="flex items-center bg-[#070514]/80 p-0.5 rounded-lg border border-purple-500/25">
            <button
              onClick={() => onBackgroundChange('dots')}
              title="Stardust Dots"
              className={`p-1 rounded text-xs transition-colors ${
                background === 'dots'
                  ? 'bg-purple-700 text-cyan-200'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onBackgroundChange('grid')}
              title="Astral Grid"
              className={`p-1 rounded text-xs transition-colors ${
                background === 'grid'
                  ? 'bg-purple-700 text-cyan-200'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onBackgroundChange('lines')}
              title="Ruled Lines"
              className={`p-1 rounded text-xs transition-colors ${
                background === 'lines'
                  ? 'bg-purple-700 text-cyan-200'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onBackgroundChange('blank')}
              title="Deep Void"
              className={`p-1 rounded text-xs transition-colors ${
                background === 'blank'
                  ? 'bg-purple-700 text-cyan-200'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chime Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Chime sound enabled' : 'Mute chimes'}
          className={`p-1.5 rounded-lg border transition-colors ${
            soundEnabled
              ? 'text-cyan-300 border-cyan-500/30 bg-cyan-950/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              : 'text-zinc-500 border-zinc-800 bg-zinc-900/50'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Clear workspace */}
        <button
          onClick={onClear}
          title="Clear current view"
          className="p-1.5 rounded-lg border border-purple-500/20 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          title="Export Grimoire"
          className="p-1.5 rounded-lg border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Zen Mode */}
        <button
          onClick={onToggleZenMode}
          title={isZenMode ? 'Exit Zen' : 'Zen Focus Mode'}
          className="p-1.5 rounded-lg border border-purple-500/25 text-purple-300 hover:text-purple-100 hover:bg-purple-950/30 transition-all"
        >
          {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
