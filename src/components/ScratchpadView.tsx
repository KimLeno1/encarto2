import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check, ArrowRight, Tag, Search, Sparkles } from 'lucide-react';
import { ScratchpadNote, StickyNoteItem } from '../types.ts';
import { generateId } from '../utils/constants.ts';
import { soundManager } from '../utils/sound.ts';

interface ScratchpadViewProps {
  notes: ScratchpadNote[];
  onUpdateNotes: (notes: ScratchpadNote[]) => void;
  onSendToCanvas: (item: StickyNoteItem) => void;
  isMobile?: boolean;
}

export const ScratchpadView: React.FC<ScratchpadViewProps> = ({
  notes,
  onUpdateNotes,
  onSendToCanvas,
  isMobile = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Spark');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tags = ['Spark', 'Miracle', 'Task', 'Idea', 'Rune'];

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundManager.playChime('mid');

    const newNote: ScratchpadNote = {
      id: generateId(),
      text: inputText.trim(),
      tag: selectedTag,
      createdAt: Date.now(),
    };

    onUpdateNotes([newNote, ...notes]);
    setInputText('');
  };

  const handleDelete = (id: string) => {
    soundManager.playChime('low');
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    soundManager.playChime('complete');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToCanvas = (note: ScratchpadNote) => {
    soundManager.playChime('high');
    const canvasNote: StickyNoteItem = {
      id: generateId(),
      type: 'note',
      x: 100 + Math.random() * 180,
      y: 100 + Math.random() * 180,
      width: isMobile ? 240 : 250,
      height: 170,
      zIndex: 10,
      createdAt: Date.now(),
      title: note.tag ? `${note.tag} ✨` : undefined,
      content: note.text,
      color:
        note.tag === 'Miracle'
          ? 'golden-miracle'
          : note.tag === 'Task'
          ? 'neon-cyan'
          : note.tag === 'Rune'
          ? 'emerald-flora'
          : 'neon-purple',
    };
    onSendToCanvas(canvasNote);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tag && n.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-[#070514]/90 flex flex-col items-center p-4 sm:p-8 z-10 relative">
      <div className="w-full max-w-2xl flex flex-col gap-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-200 to-cyan-300">
            Celestial Scratchpad
          </h2>
          <p className="text-xs text-purple-300/70 mt-0.5">
            Catch fleeting sparks and thoughts instantly. Cast them directly into your infinite canvas at any time.
          </p>
        </div>

        {/* Input Card */}
        <form
          onSubmit={handleAddNote}
          className="bg-[#0f0a28]/80 border border-purple-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-3 backdrop-blur-xl"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddNote();
              }
            }}
            placeholder="Jot down a fleeting thought or spark... (Ctrl + Enter to manifest)"
            rows={3}
            className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-purple-100 placeholder-purple-400/40 leading-relaxed font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-500/20">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
                    selectedTag === t
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : 'bg-purple-950/40 text-purple-300/70 hover:text-white border border-purple-500/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manifest</span>
            </button>
          </div>
        </form>

        {/* Search */}
        {notes.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sparks..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0f0a28]/70 border border-purple-500/25 text-purple-100 placeholder-purple-400/40 outline-none focus:border-cyan-400/60 transition-colors"
              />
            </div>
            <span className="text-xs text-purple-300/70 font-mono shrink-0">
              {filteredNotes.length} sparks
            </span>
          </div>
        )}

        {/* Notes Stream */}
        <div className="flex flex-col gap-3 pb-20">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-[#0d0922]/80 border border-purple-500/25 hover:border-cyan-400/40 rounded-2xl p-4 shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all flex flex-col gap-2.5 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs sm:text-sm text-purple-100 leading-relaxed whitespace-pre-wrap flex-1 select-text">
                  {note.text}
                </p>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(note.id, note.text)}
                    title="Copy spark"
                    className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-950/50"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSendToCanvas(note)}
                    title="Cast to Canvas"
                    className="p-1.5 rounded-lg text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/50 flex items-center gap-0.5 text-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(note.id)}
                    title="Dissolve"
                    className="p-1.5 rounded-lg text-purple-400 hover:text-rose-400 hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-purple-300/60 pt-2 border-t border-purple-500/15">
                {note.tag && (
                  <span className="font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {note.tag}
                  </span>
                )}
                <span>
                  {new Date(note.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-purple-300/50 text-xs">
              {notes.length === 0
                ? 'Your scratchpad is waiting for its first spark. Inscribe one above!'
                : 'No sparks match your inquiry.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
