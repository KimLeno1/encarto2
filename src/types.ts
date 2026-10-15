export type WorkspaceMode = 'canvas' | 'document' | 'scratchpad' | 'templates';

export type CanvasBackground = 'dots' | 'grid' | 'blank' | 'lines' | 'constellation';

export type NoteColor =
  | 'neon-purple'
  | 'neon-cyan'
  | 'golden-miracle'
  | 'emerald-flora'
  | 'cosmic-obsidian'
  | 'rose-petals';

export type DeviceModeSetting = 'auto' | 'desktop' | 'mobile';
export type ActiveDevice = 'desktop' | 'mobile';

export interface CanvasItemBase {
  id: string;
  x: number;
  y: number;
  zIndex: number;
  createdAt: number;
}

export interface StickyNoteItem extends CanvasItemBase {
  type: 'note';
  title?: string;
  content: string;
  color: NoteColor;
  width: number;
  height: number;
  glow?: boolean;
}

export interface TextItem extends CanvasItemBase {
  type: 'text';
  content: string;
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  color?: string;
  width: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistItem extends CanvasItemBase {
  type: 'checklist';
  title: string;
  color: NoteColor;
  todos: TodoItem[];
  width: number;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  isEraser?: boolean;
}

export type CanvasItem = StickyNoteItem | TextItem | ChecklistItem;

export interface DocumentState {
  title: string;
  content: string;
  lastSaved: number;
}

export interface ScratchpadNote {
  id: string;
  text: string;
  tag?: string;
  createdAt: number;
  aura?: NoteColor;
}

export interface EncartoTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'purple' | 'cyan' | 'gold';
  description: string;
  items: CanvasItem[];
  docContent?: string;
}
