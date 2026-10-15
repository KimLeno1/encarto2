import React, { useState, useEffect } from 'react';
import { DesktopNavbar } from './components/DesktopNavbar.tsx';
import { MobileHeader } from './components/MobileHeader.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { MobileActionSheet } from './components/MobileActionSheet.tsx';
import { Toolbar, CanvasTool } from './components/Toolbar.tsx';
import { CanvasView } from './components/CanvasView.tsx';
import { DocumentView } from './components/DocumentView.tsx';
import { ScratchpadView } from './components/ScratchpadView.tsx';
import { EnchantedRoomsView } from './components/EnchantedRoomsView.tsx';
import { StardustBackground } from './components/StardustBackground.tsx';
import { useDeviceMode } from './hooks/useDeviceMode.ts';
import {
  WorkspaceMode,
  CanvasBackground,
  CanvasItem,
  StickyNoteItem,
  ChecklistItem,
  TextItem,
  DrawingPath,
  DocumentState,
  ScratchpadNote,
  NoteColor,
} from './types.ts';
import { generateId, ENCARTO_TEMPLATES } from './utils/constants.ts';
import { soundManager } from './utils/sound.ts';
import { X, AlertCircle, Plus, Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  TITLE: 'encarto_workspace_title',
  MODE: 'encarto_workspace_mode',
  CANVAS_ITEMS: 'encarto_canvas_items',
  CANVAS_DRAWINGS: 'encarto_canvas_drawings',
  CANVAS_BG: 'encarto_canvas_bg',
  DOCUMENT: 'encarto_doc',
  SCRATCHPAD: 'encarto_scratchpad',
  SOUND: 'encarto_sound_enabled',
};

export default function App() {
  const { deviceSetting, setDeviceSetting, activeDevice } = useDeviceMode();
  const isMobile = activeDevice === 'mobile';

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    soundManager.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  // Main state
  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TITLE) || 'Encarto Realm';
  });

  const [mode, setMode] = useState<WorkspaceMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as WorkspaceMode) || 'canvas';
  });

  const [background, setBackground] = useState<CanvasBackground>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CANVAS_BG) as CanvasBackground) || 'dots';
  });

  const [isZenMode, setIsZenMode] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Canvas State
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANVAS_ITEMS);
      if (saved) return JSON.parse(saved);
      // Default initial starter note
      return [
        {
          id: generateId(),
          type: 'note',
          x: 100,
          y: 100,
          width: 260,
          height: 180,
          zIndex: 1,
          createdAt: Date.now(),
          color: 'neon-purple',
          title: 'Welcome to Encarto 🕯️',
          content: 'A mystical sanctuary of glowing thoughts, luminous tasks, and celestial quill sketches.\n\nTouch or double-click to manifest new ideas!',
        },
      ];
    } catch {
      return [];
    }
  });

  const [drawings, setDrawings] = useState<DrawingPath[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANVAS_DRAWINGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tools State
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [penColor, setPenColor] = useState<string>('#c084fc');
  const [penWidth, setPenWidth] = useState<number>(4);
  const [zoom, setZoom] = useState<number>(1);

  // Document State
  const [documentState, setDocumentState] = useState<DocumentState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENT);
      return saved
        ? JSON.parse(saved)
        : {
            title: 'Chronicles of the Miracle Realm',
            content:
              '# The Miracle of Encarto\n\nEvery flame begins with a single, quiet spark. Within this celestial Grimoire, give voice to thoughts that refuse to remain hidden.\n\n## Intentions\n- Inscribe the core vision with unwavering clarity.\n- Connect thoughts across the infinite starry canvas.\n- Let every word breathe in neon purple and luminous cyan light.',
            lastSaved: Date.now(),
          };
    } catch {
      return {
        title: 'Chronicles of the Miracle Realm',
        content: '',
        lastSaved: Date.now(),
      };
    }
  });

  // Scratchpad State
  const [scratchpadNotes, setScratchpadNotes] = useState<ScratchpadNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCRATCHPAD);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: generateId(),
          text: 'The miracle is not just in the magic—it is in what you choose to create.',
          tag: 'Miracle',
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          text: 'Refine the glowing neon purple and cyan radiance across both mobile and desktop views.',
          tag: 'Spark',
          createdAt: Date.now(),
        },
      ];
    } catch {
      return [];
    }
  });

  // Modal dialogs
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TITLE, title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS_BG, background);
  }, [background]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS_ITEMS, JSON.stringify(canvasItems));
  }, [canvasItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS_DRAWINGS, JSON.stringify(drawings));
  }, [drawings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENT, JSON.stringify(documentState));
  }, [documentState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, JSON.stringify(scratchpadNotes));
  }, [scratchpadNotes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isZenMode) setIsZenMode(false);
        if (showClearConfirm) setShowClearConfirm(false);
        if (showExportModal) setShowExportModal(false);
        if (isMobileSheetOpen) setIsMobileSheetOpen(false);
      }

      if (mode === 'canvas') {
        if (e.key === 'v' || e.key === 'V') setActiveTool('select');
        if (e.key === 'p' || e.key === 'P') setActiveTool('pen');
        if (e.key === 'e' || e.key === 'E') setActiveTool('eraser');
        if (e.key === 'n' || e.key === 'N') handleAddStickyNote('neon-purple');
        if (e.key === 'c' || e.key === 'C') handleAddChecklist('neon-cyan');
        if (e.key === 't' || e.key === 'T') handleAddText();
        if (e.key === '+' || e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
        if (e.key === '0') handleZoomReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isZenMode, showClearConfirm, showExportModal, isMobileSheetOpen, canvasItems]);

  // Add Item Helpers
  const handleAddStickyNote = (color: NoteColor = 'neon-purple') => {
    const newNote: StickyNoteItem = {
      id: generateId(),
      type: 'note',
      x: (isMobile ? 40 : 160) + Math.random() * 60,
      y: (isMobile ? 60 : 120) + Math.random() * 60,
      width: isMobile ? 240 : 260,
      height: 180,
      zIndex: canvasItems.length + 1,
      createdAt: Date.now(),
      content: '',
      color,
    };
    soundManager.playChime('mid');
    setCanvasItems([...canvasItems, newNote]);
  };

  const handleAddChecklist = (color: NoteColor = 'neon-cyan') => {
    const newList: ChecklistItem = {
      id: generateId(),
      type: 'checklist',
      title: 'Celestial Tasks ✨',
      x: (isMobile ? 40 : 180) + Math.random() * 60,
      y: (isMobile ? 80 : 140) + Math.random() * 60,
      width: isMobile ? 250 : 270,
      zIndex: canvasItems.length + 1,
      createdAt: Date.now(),
      color,
      todos: [
        { id: generateId(), text: 'Awaken the first idea', completed: true },
        { id: generateId(), text: 'Step through the doorway', completed: false },
      ],
    };
    soundManager.playChime('mid');
    setCanvasItems([...canvasItems, newList]);
  };

  const handleAddText = () => {
    const newText: TextItem = {
      id: generateId(),
      type: 'text',
      x: (isMobile ? 50 : 200) + Math.random() * 60,
      y: (isMobile ? 90 : 160) + Math.random() * 60,
      width: isMobile ? 240 : 270,
      zIndex: canvasItems.length + 1,
      createdAt: Date.now(),
      content: '',
      fontSize: 'large',
    };
    soundManager.playChime('low');
    setCanvasItems([...canvasItems, newText]);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.4));
  const handleZoomReset = () => setZoom(1);

  // Apply templates
  const handleApplyTemplate = (templateKeyOrItems: string | CanvasItem[]) => {
    if (Array.isArray(templateKeyOrItems)) {
      setCanvasItems([...canvasItems, ...templateKeyOrItems]);
      return;
    }

    if (templateKeyOrItems === 'miracle') {
      const tmpl = ENCARTO_TEMPLATES[0];
      setCanvasItems([...canvasItems, ...tmpl.items]);
    } else if (templateKeyOrItems === 'prophecy') {
      const tmpl = ENCARTO_TEMPLATES[1];
      setCanvasItems([...canvasItems, ...tmpl.items]);
    } else if (templateKeyOrItems === 'flora') {
      const tmpl = ENCARTO_TEMPLATES[2];
      setCanvasItems([...canvasItems, ...tmpl.items]);
    }
  };

  const handleClearCurrent = () => {
    soundManager.playChime('low');
    if (mode === 'canvas') {
      setCanvasItems([]);
      setDrawings([]);
    } else if (mode === 'document') {
      setDocumentState({
        title: 'Untitled Grimoire',
        content: '',
        lastSaved: Date.now(),
      });
    } else if (mode === 'scratchpad') {
      setScratchpadNotes([]);
    }
    setShowClearConfirm(false);
  };

  const handleExportJson = () => {
    soundManager.playChime('complete');
    const data = {
      title,
      version: 'encarto-v1',
      exportedAt: new Date().toISOString(),
      canvasItems,
      drawings,
      document: documentState,
      scratchpad: scratchpadNotes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-grimoire.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#070514] text-purple-100 font-sans select-none relative">
      {/* Animated Twinkling Stardust Background */}
      <StardustBackground />

      {/* Navigation Headers */}
      {!isZenMode && (
        <>
          {isMobile ? (
            <MobileHeader
              title={title}
              deviceSetting={deviceSetting}
              onDeviceSettingChange={setDeviceSetting}
              activeDevice={activeDevice}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onClear={() => setShowClearConfirm(true)}
              onExport={() => setShowExportModal(true)}
            />
          ) : (
            <DesktopNavbar
              title={title}
              onTitleChange={setTitle}
              mode={mode}
              onModeChange={setMode}
              background={background}
              onBackgroundChange={setBackground}
              deviceSetting={deviceSetting}
              onDeviceSettingChange={setDeviceSetting}
              activeDevice={activeDevice}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              isZenMode={isZenMode}
              onToggleZenMode={() => setIsZenMode(!isZenMode)}
              onClear={() => setShowClearConfirm(true)}
              onExport={() => setShowExportModal(true)}
            />
          )}
        </>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-purple-950/90 text-cyan-200 border border-purple-500/50 text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
        >
          <span>Exit Zen Mode</span>
          <kbd className="text-[10px] text-purple-400 font-mono">Esc</kbd>
        </button>
      )}

      {/* Main Workspace Body */}
      <main
        className={`flex-1 relative overflow-hidden ${
          isMobile ? 'pb-16' : ''
        }`}
      >
        {mode === 'canvas' && (
          <>
            <CanvasView
              items={canvasItems}
              onUpdateItems={setCanvasItems}
              drawings={drawings}
              onUpdateDrawings={setDrawings}
              background={background}
              activeTool={activeTool}
              penColor={penColor}
              penWidth={penWidth}
              zoom={zoom}
              onZoomChange={setZoom}
              isMobile={isMobile}
            />

            {/* Desktop Floating Toolbar */}
            {!isMobile && (
              <Toolbar
                activeTool={activeTool}
                onToolSelect={setActiveTool}
                onAddStickyNote={handleAddStickyNote}
                onAddChecklist={handleAddChecklist}
                onAddText={handleAddText}
                penColor={penColor}
                onPenColorChange={setPenColor}
                penWidth={penWidth}
                onPenWidthChange={setPenWidth}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onApplyTemplate={handleApplyTemplate}
              />
            )}

            {/* Mobile Floating Radial Action Button (FAB) */}
            {isMobile && (
              <button
                onClick={() => {
                  soundManager.playChime('high');
                  setIsMobileSheetOpen(true);
                }}
                className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.7)] active:scale-95 transition-transform cursor-pointer border border-white/20"
                title="Manifest Note or Quill"
              >
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </button>
            )}

            {/* Mobile Action Bottom Sheet */}
            {isMobile && (
              <MobileActionSheet
                isOpen={isMobileSheetOpen}
                onClose={() => setIsMobileSheetOpen(false)}
                onAddStickyNote={handleAddStickyNote}
                onAddChecklist={handleAddChecklist}
                onAddText={handleAddText}
                activeTool={activeTool}
                onToolSelect={setActiveTool}
                penColor={penColor}
                onPenColorChange={setPenColor}
              />
            )}
          </>
        )}

        {mode === 'document' && (
          <DocumentView
            document={documentState}
            onUpdateDocument={setDocumentState}
            isMobile={isMobile}
          />
        )}

        {mode === 'scratchpad' && (
          <ScratchpadView
            notes={scratchpadNotes}
            onUpdateNotes={setScratchpadNotes}
            onSendToCanvas={(item) => {
              setCanvasItems((prev) => [...prev, item]);
              setMode('canvas');
            }}
            isMobile={isMobile}
          />
        )}

        {mode === 'templates' && (
          <EnchantedRoomsView
            onApplyTemplate={(items) => {
              setCanvasItems((prev) => [...prev, ...items]);
            }}
            onOpenCanvas={() => setMode('canvas')}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && !isZenMode && (
        <MobileBottomNav mode={mode} onModeChange={setMode} />
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120b28] border border-purple-500/40 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(244,63,94,0.3)] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Dissolve {mode === 'canvas' ? 'Canvas Elements' : mode === 'document' ? 'Grimoire Draft' : 'Scratchpad Sparks'}?
                </h3>
                <p className="text-xs text-purple-300/70 mt-0.5">
                  This will dissolve all active items in the current view back into stardust.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/20">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-purple-950/50 transition-colors"
              >
                Retain
              </button>
              <button
                onClick={handleClearCurrent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.5)]"
              >
                Dissolve Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120b28] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-cyan-200">
                Preserve Encarto Grimoire
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed">
              Download a complete celestial archive containing your canvas notes, constellations, neon sketches, Grimoire writings, and scratchpad sparks as a clean JSON backup.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExportJson}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:opacity-95 transition-opacity"
              >
                <span>Download Grimoire Archive (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
