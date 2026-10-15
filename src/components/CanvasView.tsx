import React, { useState, useRef, useCallback } from 'react';
import {
  CanvasItem,
  StickyNoteItem,
  TextItem,
  ChecklistItem,
  CanvasBackground,
  DrawingPath,
  NoteColor,
} from '../types.ts';
import { NOTE_COLORS, generateId, ENCARTO_ASSETS } from '../utils/constants.ts';
import { CanvasTool } from './Toolbar.tsx';
import { soundManager } from '../utils/sound.ts';
import {
  X,
  Plus,
  Palette,
  GripHorizontal,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CanvasViewProps {
  items: CanvasItem[];
  onUpdateItems: (items: CanvasItem[]) => void;
  drawings: DrawingPath[];
  onUpdateDrawings: (drawings: DrawingPath[]) => void;
  background: CanvasBackground;
  activeTool: CanvasTool;
  penColor: string;
  penWidth: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isMobile?: boolean;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  items,
  onUpdateItems,
  drawings,
  onUpdateDrawings,
  background,
  activeTool,
  penColor,
  penWidth,
  zoom,
  isMobile = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [colorPickerItemId, setColorPickerItemId] = useState<string | null>(null);

  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...items.map((i) => i.zIndex || 1));
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, zIndex: maxZ + 1 } : item))
    );
  };

  const deleteItem = (id: string) => {
    soundManager.playChime('low');
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    onUpdateItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates } as CanvasItem;
        }
        return item;
      })
    );
  };

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      e.button === 1 ||
      e.buttons === 4 ||
      (activeTool === 'select' &&
        (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-svg-layer'))
    ) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (activeTool === 'pen') {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setCurrentPath({
        id: generateId(),
        points: [{ x, y }],
        color: penColor,
        size: penWidth,
      });
      return;
    }

    if (activeTool === 'eraser') {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const threshold = 16 / zoom;
      const filtered = drawings.filter((d) => {
        return !d.points.some((p) => Math.hypot(p.x - x, p.y - y) < threshold + d.size);
      });
      if (filtered.length !== drawings.length) {
        soundManager.playChime('low');
        onUpdateDrawings(filtered);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y,
      });
      return;
    }

    if (activeTool === 'pen' && currentPath) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const lastPoint = currentPath.points[currentPath.points.length - 1];
      if (!lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) > 2) {
        setCurrentPath({
          ...currentPath,
          points: [...currentPath.points, { x, y }],
        });
      }
      return;
    }

    if (activeTool === 'eraser' && e.buttons === 1) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const threshold = 16 / zoom;
      const filtered = drawings.filter((d) => {
        return !d.points.some((p) => Math.hypot(p.x - x, p.y - y) < threshold + d.size);
      });
      if (filtered.length !== drawings.length) {
        onUpdateDrawings(filtered);
      }
      return;
    }

    if (draggedItemId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      updateItem(draggedItemId, {
        x: Math.round(x - dragOffset.x),
        y: Math.round(y - dragOffset.y),
      });
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (currentPath) {
      if (currentPath.points.length > 0) {
        onUpdateDrawings([...drawings, currentPath]);
      }
      setCurrentPath(null);
    }
    if (draggedItemId) {
      setDraggedItemId(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    if (e.target !== containerRef.current && (e.target as HTMLElement).id !== 'canvas-svg-layer')
      return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const newNote: StickyNoteItem = {
      id: generateId(),
      type: 'note',
      x: Math.round(x - 120),
      y: Math.round(y - 85),
      width: isMobile ? 240 : 250,
      height: 170,
      zIndex: items.length + 1,
      createdAt: Date.now(),
      content: '',
      color: 'neon-purple',
    };
    soundManager.playChime('mid');
    onUpdateItems([...items, newNote]);
  };

  const pointsToSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return d;
  };

  const handleItemDragStart = (id: string, e: React.PointerEvent) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    bringToFront(id);
    setDraggedItemId(id);
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    setDragOffset({
      x: x - item.x,
      y: y - item.y,
    });
  };

  const getBgClass = () => {
    switch (background) {
      case 'dots':
        return 'bg-dots-pattern text-purple-500/20 bg-[#090618]';
      case 'grid':
        return 'bg-grid-pattern text-purple-500/15 bg-[#090618]';
      case 'lines':
        return 'bg-lines-pattern text-cyan-500/15 bg-[#090618]';
      case 'blank':
      default:
        return 'bg-[#090618]';
    }
  };

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full overflow-hidden select-none cursor-${
        activeTool === 'pen'
          ? 'crosshair'
          : activeTool === 'eraser'
          ? 'cell'
          : isPanning
          ? 'grabbing'
          : 'default'
      } ${getBgClass()}`}
    >
      {/* Pan & Zoom Transform Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* SVG Drawing Layer with Neon Glow */}
        <svg
          id="canvas-svg-layer"
          className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-auto"
          style={{ overflow: 'visible' }}
        >
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.6" />
          </filter>

          {drawings.map((draw) => (
            <path
              key={draw.id}
              d={pointsToSvgPath(draw.points)}
              stroke={draw.color}
              strokeWidth={draw.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 ${Math.max(2, draw.size)}px ${draw.color})`,
              }}
            />
          ))}

          {currentPath && (
            <path
              d={pointsToSvgPath(currentPath.points)}
              stroke={currentPath.color}
              strokeWidth={currentPath.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 ${Math.max(2, currentPath.size)}px ${currentPath.color})`,
              }}
            />
          )}
        </svg>

        {/* Empty Canvas Sanctuary State */}
        {items.length === 0 && drawings.length === 0 && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-center p-6 sm:p-8 max-w-sm rounded-3xl border border-purple-500/30 bg-[#0f0a28]/70 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.25)]"
            style={{ width: isMobile ? '290px' : '340px' }}
          >
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] mb-3 bg-purple-950">
              <img
                src={ENCARTO_ASSETS.candle}
                alt="Miracle Flame"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-200 to-cyan-400 mb-1">
              Your Encarto Sanctuary
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed mb-3">
              {isMobile
                ? 'Tap the glowing (+) action button below to cast your first note or draw with the neon quill.'
                : 'Double-click anywhere or pick a tool below to cast enchanted notes, luminous tasks, or quill sketches.'}
            </p>
            {!isMobile && (
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono">
                <kbd className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-200">
                  Double Click
                </kbd>
                <span>to manifest note</span>
              </div>
            )}
          </div>
        )}

        {/* Canvas Items */}
        {items.map((item) => {
          if (item.type === 'note') {
            const colors = NOTE_COLORS[item.color] || NOTE_COLORS['neon-purple'];
            return (
              <div
                key={item.id}
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  width: `${item.width}px`,
                  zIndex: item.zIndex,
                }}
                className={`absolute rounded-2xl border ${colors.bg} ${colors.border} ${colors.shadow} ${colors.glow} transition-shadow group flex flex-col select-text`}
              >
                {/* Drag Handle */}
                <div
                  onPointerDown={(e) => handleItemDragStart(item.id, e)}
                  className={`h-8 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing rounded-t-2xl ${colors.header}`}
                >
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <GripHorizontal className="w-3.5 h-3.5" />
                    <div className={`w-2 h-2 rounded-full ${colors.accentDot} animate-pulse`} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setColorPickerItemId(colorPickerItemId === item.id ? null : item.id);
                      }}
                      className="p-1 rounded text-purple-300/70 hover:text-cyan-300 transition-colors"
                      title="Change aura"
                    >
                      <Palette className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="p-1 rounded text-purple-300/70 hover:text-rose-400 transition-colors"
                      title="Dissolve"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Aura Popover */}
                {colorPickerItemId === item.id && (
                  <div className="absolute top-9 right-2 z-50 bg-[#120b28] border border-purple-500/40 rounded-xl p-2 shadow-2xl flex gap-1.5">
                    {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItem(item.id, { color: c });
                          setColorPickerItemId(null);
                          soundManager.playChime('mid');
                        }}
                        className={`w-5 h-5 rounded-md border ${NOTE_COLORS[c].bg} ${NOTE_COLORS[c].border}`}
                      />
                    ))}
                  </div>
                )}

                {/* Note Body */}
                <div className="p-3.5 flex-1 flex flex-col">
                  <input
                    type="text"
                    value={item.title || ''}
                    placeholder="Intent / Title..."
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className={`font-bold text-xs tracking-tight bg-transparent outline-none mb-1.5 placeholder-purple-400/40 ${colors.text}`}
                  />
                  <textarea
                    value={item.content}
                    placeholder="Inscribe thoughts here..."
                    onChange={(e) => updateItem(item.id, { content: e.target.value })}
                    className={`w-full h-28 text-xs leading-relaxed bg-transparent resize-y outline-none placeholder-purple-400/35 font-sans ${colors.text}`}
                  />
                </div>
              </div>
            );
          }

          if (item.type === 'checklist') {
            const colors = NOTE_COLORS[item.color] || NOTE_COLORS['neon-cyan'];
            return (
              <div
                key={item.id}
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  width: `${item.width}px`,
                  zIndex: item.zIndex,
                }}
                className={`absolute rounded-2xl border ${colors.bg} ${colors.border} ${colors.shadow} ${colors.glow} transition-shadow group flex flex-col select-text`}
              >
                {/* Header */}
                <div
                  onPointerDown={(e) => handleItemDragStart(item.id, e)}
                  className={`h-8 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing rounded-t-2xl ${colors.header}`}
                >
                  <div className="flex items-center gap-1.5">
                    <GripHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      placeholder="Constellation Tasks"
                      className={`text-xs font-bold bg-transparent outline-none ${colors.text}`}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-1 rounded text-cyan-300/70 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Todos */}
                <div className="p-3.5 space-y-2.5">
                  {item.todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-2 group/todo">
                      <button
                        onClick={() => {
                          const updated = item.todos.map((t) =>
                            t.id === todo.id ? { ...t, completed: !t.completed } : t
                          );
                          updateItem(item.id, { todos: updated });
                          soundManager.playChime(todo.completed ? 'low' : 'complete');
                        }}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          todo.completed
                            ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                            : 'border-purple-500/40 bg-purple-950/40 text-transparent'
                        }`}
                      >
                        {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <input
                        type="text"
                        value={todo.text}
                        onChange={(e) => {
                          const updated = item.todos.map((t) =>
                            t.id === todo.id ? { ...t, text: e.target.value } : t
                          );
                          updateItem(item.id, { todos: updated });
                        }}
                        placeholder="Task..."
                        className={`text-xs flex-1 bg-transparent outline-none ${
                          todo.completed ? 'line-through opacity-45' : ''
                        } ${colors.text}`}
                      />

                      <button
                        onClick={() => {
                          const updated = item.todos.filter((t) => t.id !== todo.id);
                          updateItem(item.id, { todos: updated });
                        }}
                        className="opacity-0 group-hover/todo:opacity-100 p-0.5 text-zinc-400 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem('newTodo') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const newTodo = {
                          id: generateId(),
                          text: input.value.trim(),
                          completed: false,
                        };
                        updateItem(item.id, { todos: [...item.todos, newTodo] });
                        soundManager.playChime('mid');
                        input.value = '';
                      }
                    }}
                    className="flex items-center gap-1.5 pt-1.5 border-t border-purple-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <input
                      name="newTodo"
                      type="text"
                      placeholder="Add step + enter..."
                      className={`text-xs bg-transparent outline-none flex-1 placeholder-purple-300/40 ${colors.text}`}
                    />
                  </form>
                </div>
              </div>
            );
          }

          if (item.type === 'text') {
            const fontSizes = {
              small: 'text-sm',
              medium: 'text-lg font-semibold',
              large: 'text-2xl font-extrabold',
              huge: 'text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]',
            };

            return (
              <div
                key={item.id}
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  width: `${item.width}px`,
                  zIndex: item.zIndex,
                }}
                className="absolute group rounded-xl hover:border hover:border-cyan-400/40 p-2 transition-all select-text"
              >
                <div className="absolute -top-7 left-0 hidden group-hover:flex items-center gap-1 bg-[#120b28] border border-purple-500/40 px-2 py-0.5 rounded-lg shadow-xl text-xs">
                  <div
                    onPointerDown={(e) => handleItemDragStart(item.id, e)}
                    className="cursor-grab active:cursor-grabbing p-0.5 text-purple-400"
                  >
                    <GripHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={item.fontSize}
                    onChange={(e) =>
                      updateItem(item.id, {
                        fontSize: e.target.value as TextItem['fontSize'],
                      })
                    }
                    className="bg-transparent text-[11px] font-semibold outline-none text-cyan-300"
                  >
                    <option value="small" className="bg-[#120b28]">Small</option>
                    <option value="medium" className="bg-[#120b28]">Medium</option>
                    <option value="large" className="bg-[#120b28]">Large</option>
                    <option value="huge" className="bg-[#120b28]">Runic Title</option>
                  </select>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-0.5 text-zinc-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <textarea
                  value={item.content}
                  onChange={(e) => updateItem(item.id, { content: e.target.value })}
                  placeholder="Inscribe rune text..."
                  rows={2}
                  className={`w-full bg-transparent resize-none outline-none text-cyan-200 placeholder-purple-400/40 ${fontSizes[item.fontSize]}`}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
