import React, { useState } from 'react';
import {
  MousePointer,
  Pen,
  Eraser,
  StickyNote,
  CheckSquare,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Sparkles,
} from 'lucide-react';
import { NoteColor } from '../types.ts';
import { NOTE_COLORS, PEN_COLORS } from '../utils/constants.ts';
import { soundManager } from '../utils/sound.ts';

export type CanvasTool = 'select' | 'pen' | 'eraser';

interface ToolbarProps {
  activeTool: CanvasTool;
  onToolSelect: (tool: CanvasTool) => void;
  onAddStickyNote: (color: NoteColor) => void;
  onAddChecklist: (color: NoteColor) => void;
  onAddText: () => void;
  penColor: string;
  onPenColorChange: (color: string) => void;
  penWidth: number;
  onPenWidthChange: (width: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onApplyTemplate: (templateName: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolSelect,
  onAddStickyNote,
  onAddChecklist,
  onAddText,
  penColor,
  onPenColorChange,
  penWidth,
  onPenWidthChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onApplyTemplate,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPenSettings, setShowPenSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedNoteColor, setSelectedNoteColor] = useState<NoteColor>('neon-purple');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      {/* Neon Pen Settings Popover */}
      {showPenSettings && activeTool === 'pen' && (
        <div className="bg-[#120b28]/95 border border-purple-500/40 rounded-2xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex flex-col gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-purple-300">Quill Aura:</span>
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onPenColorChange(c);
                  soundManager.playChime('high');
                }}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border border-white/20 transition-transform ${
                  penColor === c ? 'scale-125 ring-2 ring-cyan-400' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-purple-500/25">
            <span className="text-[11px] font-semibold text-purple-300">Stroke:</span>
            {[2, 4, 8, 14].map((size) => (
              <button
                key={size}
                onClick={() => onPenWidthChange(size)}
                className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-medium ${
                  penWidth === size
                    ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(168,85,247,0.6)] font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div
                  className="rounded-full bg-cyan-300"
                  style={{ width: `${Math.min(size + 2, 14)}px`, height: `${Math.min(size + 2, 14)}px` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note Color Picker Popover */}
      {showColorPicker && (
        <div className="bg-[#120b28]/95 border border-purple-500/40 rounded-2xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-[11px] font-semibold text-purple-300">Choose Note Aura:</span>
          {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedNoteColor(c);
                onAddStickyNote(c);
                soundManager.playChime('mid');
                setShowColorPicker(false);
              }}
              title={c}
              className={`w-6 h-6 rounded-lg border transition-transform ${NOTE_COLORS[c].bg} ${NOTE_COLORS[c].border} ${
                selectedNoteColor === c ? 'scale-120 ring-2 ring-cyan-400' : 'hover:scale-110'
              }`}
            />
          ))}
        </div>
      )}

      {/* Templates Popover */}
      {showTemplates && (
        <div className="bg-[#120b28]/95 border border-purple-500/40 rounded-2xl p-2.5 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col gap-1 w-56 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 px-2 py-1">
            Enchanted Presets:
          </div>
          <button
            onClick={() => {
              onApplyTemplate('miracle');
              soundManager.playChime('complete');
              setShowTemplates(false);
            }}
            className="text-left text-xs font-medium px-2.5 py-2 rounded-xl hover:bg-purple-900/40 text-purple-200 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>🕯️ Miracle Vision Room</span>
          </button>
          <button
            onClick={() => {
              onApplyTemplate('prophecy');
              soundManager.playChime('complete');
              setShowTemplates(false);
            }}
            className="text-left text-xs font-medium px-2.5 py-2 rounded-xl hover:bg-cyan-900/40 text-cyan-200 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>🔮 Vision Doorway</span>
          </button>
          <button
            onClick={() => {
              onApplyTemplate('flora');
              soundManager.playChime('complete');
              setShowTemplates(false);
            }}
            className="text-left text-xs font-medium px-2.5 py-2 rounded-xl hover:bg-rose-900/40 text-rose-200 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>🌺 Isabela’s Bloom</span>
          </button>
        </div>
      )}

      {/* Main Glassmorphic Neon Dock */}
      <div className="bg-[#0b081e]/90 border border-purple-500/35 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.25)] rounded-2xl p-1.5 flex items-center gap-1 backdrop-blur-xl ring-1 ring-white/5">
        {/* Select / Move */}
        <button
          onClick={() => {
            onToolSelect('select');
            setShowPenSettings(false);
            setShowColorPicker(false);
          }}
          title="Select (V)"
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'select'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-purple-950/40'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Neon Quill */}
        <div className="relative">
          <button
            onClick={() => {
              if (activeTool === 'pen') {
                setShowPenSettings(!showPenSettings);
              } else {
                onToolSelect('pen');
                setShowPenSettings(true);
              }
              setShowColorPicker(false);
              setShowTemplates(false);
            }}
            title="Neon Quill (P)"
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTool === 'pen'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'text-zinc-400 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Pen className="w-4 h-4" />
            <div
              className="w-1.5 h-1.5 rounded-full ring-1 ring-white/40 shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: penColor, color: penColor }}
            />
          </button>
        </div>

        {/* Eraser */}
        <button
          onClick={() => {
            onToolSelect('eraser');
            setShowPenSettings(false);
            setShowColorPicker(false);
          }}
          title="Eraser (E)"
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-purple-950/40'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-purple-500/25 mx-1" />

        {/* Add Note */}
        <button
          onClick={() => {
            onAddStickyNote(selectedNoteColor);
            soundManager.playChime('mid');
            onToolSelect('select');
          }}
          title="Add Enchanted Note"
          className="p-2 rounded-xl text-xs font-medium text-purple-300 hover:text-purple-100 hover:bg-purple-950/50 flex items-center gap-1.5 transition-colors"
        >
          <StickyNote className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Note</span>
        </button>

        {/* Color Palette Trigger */}
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowPenSettings(false);
            setShowTemplates(false);
          }}
          title="Aura color"
          className="p-1 rounded-lg text-purple-400/80 hover:text-cyan-300 hover:bg-purple-950/40 transition-colors"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* Add Checklist */}
        <button
          onClick={() => {
            onAddChecklist('neon-cyan');
            soundManager.playChime('mid');
            onToolSelect('select');
          }}
          title="Add Luminous Checklist"
          className="p-2 rounded-xl text-xs font-medium text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40 flex items-center gap-1.5 transition-colors"
        >
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Tasks</span>
        </button>

        {/* Add Text */}
        <button
          onClick={() => {
            onAddText();
            soundManager.playChime('low');
            onToolSelect('select');
          }}
          title="Add Text Block"
          className="p-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-purple-950/40 flex items-center gap-1.5 transition-colors"
        >
          <Type className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">Runes</span>
        </button>

        {/* Templates */}
        <button
          onClick={() => {
            setShowTemplates(!showTemplates);
            setShowPenSettings(false);
            setShowColorPicker(false);
          }}
          title="Enchanted presets"
          className="p-2 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-100 hover:bg-amber-950/40 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-purple-500/25 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onZoomReset}
            title="Reset Zoom"
            className="text-xs font-mono px-1.5 py-0.5 rounded text-purple-300 hover:bg-purple-950/50"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
