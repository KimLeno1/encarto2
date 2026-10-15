import React from 'react';
import { StickyNote, CheckSquare, Type, Pen, X, Sparkles } from 'lucide-react';
import { NoteColor } from '../types.ts';
import { NOTE_COLORS, PEN_COLORS } from '../utils/constants.ts';
import { CanvasTool } from './Toolbar.tsx';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStickyNote: (color: NoteColor) => void;
  onAddChecklist: (color: NoteColor) => void;
  onAddText: () => void;
  activeTool: CanvasTool;
  onToolSelect: (tool: CanvasTool) => void;
  penColor: string;
  onPenColorChange: (color: string) => void;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  onAddStickyNote,
  onAddChecklist,
  onAddText,
  activeTool,
  onToolSelect,
  penColor,
  onPenColorChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
      {/* Tap backdrop to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="bg-[#0f0b24] border-t border-purple-500/30 rounded-t-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 pb-8">
        {/* Drag Handle */}
        <div className="w-10 h-1.5 bg-purple-500/40 rounded-full mx-auto" />

        <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
            Create on Canvas
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              onAddStickyNote('neon-purple');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 active:scale-95 transition-transform"
          >
            <StickyNote className="w-6 h-6 text-purple-400 mb-1" />
            <span className="text-xs font-medium text-purple-200">Aura Note</span>
          </button>

          <button
            onClick={() => {
              onAddChecklist('neon-cyan');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 active:scale-95 transition-transform"
          >
            <CheckSquare className="w-6 h-6 text-cyan-400 mb-1" />
            <span className="text-xs font-medium text-cyan-200">Checklist</span>
          </button>

          <button
            onClick={() => {
              onAddText();
              onClose();
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1b1535] border border-purple-500/30 active:scale-95 transition-transform"
          >
            <Type className="w-6 h-6 text-zinc-300 mb-1" />
            <span className="text-xs font-medium text-zinc-200">Text Runes</span>
          </button>
        </div>

        {/* Note Auras */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-purple-300/80">
            Or choose a specific aura color:
          </span>
          <div className="flex items-center gap-2">
            {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  onAddStickyNote(c);
                  onClose();
                }}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center active:scale-90 transition-transform ${NOTE_COLORS[c].bg} ${NOTE_COLORS[c].border}`}
              >
                <div className={`w-2 h-2 rounded-full ${NOTE_COLORS[c].accentDot}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Neon Quill Mode Switch */}
        <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
          <button
            onClick={() => {
              onToolSelect(activeTool === 'pen' ? 'select' : 'pen');
              onClose();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'pen'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-purple-900/50 text-purple-200 border border-purple-500/30'
            }`}
          >
            <Pen className="w-4 h-4" />
            <span>{activeTool === 'pen' ? 'Drawing Active' : 'Enable Neon Quill'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onPenColorChange(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border border-black/30 ${
                  penColor === c ? 'ring-2 ring-cyan-400 scale-110' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
