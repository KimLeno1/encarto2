import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Copy,
  Check,
  Download,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { DocumentState } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface DocumentViewProps {
  document: DocumentState;
  onUpdateDocument: (doc: DocumentState) => void;
  isMobile?: boolean;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  document,
  onUpdateDocument,
  isMobile = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const words = document.content.trim() ? document.content.trim().split(/\s+/).length : 0;
  const characters = document.content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    soundManager.playChime('high');

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = document.content;
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}text${suffix}`;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    onUpdateDocument({
      ...document,
      content: newContent,
      lastSaved: Date.now(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + replacement.length - suffix.length
      );
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${document.title}\n\n${document.content}`);
    soundManager.playChime('complete');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const fullText = `# ${document.title || 'Untitled Grimoire'}\n\n${document.content}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${(document.title || 'grimoire').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#070514]/90 flex flex-col items-center px-4 py-4 sm:py-8 z-10 relative">
      {/* Top Floating Formatting Bar */}
      <div className="sticky top-2 z-20 my-2 bg-[#0e0924]/90 border border-purple-500/35 backdrop-blur-xl rounded-2xl p-1 shadow-[0_0_25px_rgba(168,85,247,0.2)] flex items-center gap-0.5 max-w-full overflow-x-auto">
        <button
          onClick={() => applyFormat('**', '**')}
          title="Bold"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat('*', '*')}
          title="Italic"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat('~~', '~~')}
          title="Strikethrough"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-purple-500/30 mx-1 shrink-0" />

        <button
          onClick={() => applyFormat('\n# ')}
          title="Heading 1"
          className="p-2 rounded-xl text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat('\n## ')}
          title="Heading 2"
          className="p-2 rounded-xl text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-purple-500/30 mx-1 shrink-0" />

        <button
          onClick={() => applyFormat('\n- ')}
          title="List"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat('\n> ')}
          title="Quote"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat('`', '`')}
          title="Code"
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-950/60"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-purple-500/30 mx-1 shrink-0" />

        <button
          onClick={handleCopy}
          title="Copy"
          className="p-2 rounded-xl text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40 flex items-center gap-1"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDownloadMarkdown}
          title="Download Markdown"
          className="p-2 rounded-xl text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Parchment Editor Surface */}
      <div className="w-full max-w-3xl flex-1 px-4 sm:px-10 py-6 sm:py-8 flex flex-col bg-[#0b081e]/80 border border-purple-500/25 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] my-4 backdrop-blur-md">
        <input
          type="text"
          value={document.title}
          onChange={(e) =>
            onUpdateDocument({
              ...document,
              title: e.target.value,
              lastSaved: Date.now(),
            })
          }
          placeholder="Grimoire Title..."
          className="w-full text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-200 to-cyan-300 outline-none placeholder-purple-400/30 mb-6 drop-shadow-sm font-sans"
        />

        <textarea
          ref={textareaRef}
          value={document.content}
          onChange={(e) =>
            onUpdateDocument({
              ...document,
              content: e.target.value,
              lastSaved: Date.now(),
            })
          }
          placeholder="Inscribe your thoughts, chronicles, or grand visions into the celestial parchment..."
          className="w-full flex-1 bg-transparent resize-none outline-none text-purple-100/90 text-sm sm:text-base leading-relaxed placeholder-purple-400/30 font-sans min-h-[480px]"
        />

        {/* Footer Statistics */}
        <div className="py-4 mt-6 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs text-purple-300/60 gap-2">
          <div className="flex items-center gap-3 font-mono">
            <span>{words} words</span>
            <span>·</span>
            <span>{characters} characters</span>
            {words > 0 && (
              <>
                <span>·</span>
                <span>~{readingTimeMinutes} min read</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Preserved locally</span>
          </div>
        </div>
      </div>
    </div>
  );
};
