import { NoteColor, EncartoTemplate } from '../types.ts';

// Generated Encarto Assets
export const ENCARTO_ASSETS = {
  aurora: '/src/assets/images/encarto_aurora_nebula_1791953843841.jpg',
  candle: '/src/assets/images/encarto_magical_candle_1791953843876.jpg',
  doorway: '/src/assets/images/encarto_glowing_doorway_1791953844214.jpg',
};

export const NOTE_COLORS: Record<
  NoteColor,
  {
    bg: string;
    border: string;
    text: string;
    header: string;
    shadow: string;
    glow: string;
    accentDot: string;
  }
> = {
  'neon-purple': {
    bg: 'bg-[#150d2e]/90 dark:bg-[#120b28]/95 backdrop-blur-md',
    border: 'border-purple-500/40 hover:border-purple-400',
    text: 'text-purple-100',
    header: 'bg-purple-950/70 border-b border-purple-500/30 text-purple-200',
    shadow: 'shadow-[0_8px_30px_rgb(168,85,247,0.2)]',
    glow: 'ring-1 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    accentDot: 'bg-purple-400',
  },
  'neon-cyan': {
    bg: 'bg-[#081a2f]/90 dark:bg-[#071728]/95 backdrop-blur-md',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    text: 'text-cyan-100',
    header: 'bg-cyan-950/70 border-b border-cyan-500/30 text-cyan-200',
    shadow: 'shadow-[0_8px_30px_rgb(6,182,212,0.2)]',
    glow: 'ring-1 ring-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.35)]',
    accentDot: 'bg-cyan-400',
  },
  'golden-miracle': {
    bg: 'bg-[#261c0a]/90 dark:bg-[#1f1607]/95 backdrop-blur-md',
    border: 'border-amber-500/40 hover:border-amber-400',
    text: 'text-amber-100',
    header: 'bg-amber-950/70 border-b border-amber-500/30 text-amber-200',
    shadow: 'shadow-[0_8px_30px_rgb(245,158,11,0.2)]',
    glow: 'ring-1 ring-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    accentDot: 'bg-amber-400',
  },
  'emerald-flora': {
    bg: 'bg-[#0b241b]/90 dark:bg-[#081e16]/95 backdrop-blur-md',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    text: 'text-emerald-100',
    header: 'bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-200',
    shadow: 'shadow-[0_8px_30px_rgb(16,185,129,0.2)]',
    glow: 'ring-1 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.35)]',
    accentDot: 'bg-emerald-400',
  },
  'cosmic-obsidian': {
    bg: 'bg-[#0f0b1f]/95 dark:bg-[#0a0718]/95 backdrop-blur-md',
    border: 'border-purple-900/60 hover:border-cyan-500/40',
    text: 'text-zinc-100',
    header: 'bg-purple-950/50 border-b border-purple-800/40 text-purple-300',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.5)]',
    glow: 'ring-1 ring-purple-600/40 shadow-[0_0_20px_rgba(147,51,234,0.3)]',
    accentDot: 'bg-zinc-300',
  },
  'rose-petals': {
    bg: 'bg-[#290d20]/90 dark:bg-[#200818]/95 backdrop-blur-md',
    border: 'border-rose-500/40 hover:border-rose-400',
    text: 'text-rose-100',
    header: 'bg-rose-950/70 border-b border-rose-500/30 text-rose-200',
    shadow: 'shadow-[0_8px_30px_rgb(244,63,94,0.2)]',
    glow: 'ring-1 ring-rose-400/40 shadow-[0_0_20px_rgba(251,113,133,0.35)]',
    accentDot: 'bg-rose-400',
  },
};

export const PEN_COLORS = [
  '#c084fc', // Neon Purple
  '#38bdf8', // Neon Light Blue / Cyan
  '#fbbf24', // Miracle Gold
  '#34d399', // Emerald Flora
  '#f43f5e', // Neon Rose
  '#ffffff', // Ethereal Starlight
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export const ENCARTO_TEMPLATES: EncartoTemplate[] = [
  {
    id: 'miracle-vision',
    title: 'The Miracle Room',
    subtitle: 'Core Vision, Purpose & Spark',
    icon: '🕯️',
    accent: 'purple',
    description: 'A sanctuary to anchor your high-level mission, core values, and luminous guiding principles.',
    items: [
      {
        id: generateId(),
        type: 'note',
        x: 120,
        y: 100,
        width: 260,
        height: 180,
        zIndex: 1,
        createdAt: Date.now(),
        color: 'neon-purple',
        title: 'Core Purpose 🕯️',
        content: '• What is the spark?\n• Who does this serve?\n• The guiding light that never flickers.',
      },
      {
        id: generateId(),
        type: 'checklist',
        x: 420,
        y: 100,
        width: 280,
        zIndex: 2,
        createdAt: Date.now(),
        color: 'neon-cyan',
        title: 'Key Milestones ✨',
        todos: [
          { id: generateId(), text: 'Define the foundational principle', completed: true },
          { id: generateId(), text: 'Bring together the circle', completed: false },
          { id: generateId(), text: 'Ignite the first milestone', completed: false },
        ],
      },
      {
        id: generateId(),
        type: 'note',
        x: 740,
        y: 100,
        width: 260,
        height: 180,
        zIndex: 3,
        createdAt: Date.now(),
        color: 'golden-miracle',
        title: 'Guiding Light 🌟',
        content: '"The miracle is not some magic that you’ve got; the miracle is you."',
      },
    ],
  },
  {
    id: 'prophecy-board',
    title: 'The Vision Doorway',
    subtitle: 'Strategic Roadmap & Future Timeline',
    icon: '🔮',
    accent: 'cyan',
    description: 'Peer through the luminous doorway into future quarters, milestones, and breakthroughs.',
    items: [
      {
        id: generateId(),
        type: 'checklist',
        x: 100,
        y: 110,
        width: 270,
        zIndex: 1,
        createdAt: Date.now(),
        color: 'neon-cyan',
        title: 'Phase 1: Emergence 🌌',
        todos: [
          { id: generateId(), text: 'Architect the core foundation', completed: true },
          { id: generateId(), text: 'Verify aesthetic balance', completed: true },
          { id: generateId(), text: 'Initial release preview', completed: false },
        ],
      },
      {
        id: generateId(),
        type: 'checklist',
        x: 400,
        y: 110,
        width: 270,
        zIndex: 2,
        createdAt: Date.now(),
        color: 'neon-purple',
        title: 'Phase 2: Ascension ⚡',
        todos: [
          { id: generateId(), text: 'Collaborative live rooms', completed: false },
          { id: generateId(), text: 'Automated synthesis', completed: false },
        ],
      },
      {
        id: generateId(),
        type: 'note',
        x: 700,
        y: 110,
        width: 250,
        height: 170,
        zIndex: 3,
        createdAt: Date.now(),
        color: 'emerald-flora',
        title: 'Future Vision 🌿',
        content: 'End state: A seamless creative environment that adapts seamlessly between desktop and mobile.',
      },
    ],
  },
  {
    id: 'flora-creation',
    title: 'Isabela’s Bloom',
    subtitle: 'Creative Ideation & Brainstorming',
    icon: '🌺',
    accent: 'purple',
    description: 'Grow unexpected ideas and vibrant experiments without constraints or hesitation.',
    items: [
      {
        id: generateId(),
        type: 'note',
        x: 120,
        y: 100,
        width: 240,
        height: 170,
        zIndex: 1,
        createdAt: Date.now(),
        color: 'rose-petals',
        title: 'Wild Ideas 🌺',
        content: '• What if we make it fluid?\n• Unconventional layouts\n• Tactile vibrations',
      },
      {
        id: generateId(),
        type: 'note',
        x: 390,
        y: 100,
        width: 240,
        height: 170,
        zIndex: 2,
        createdAt: Date.now(),
        color: 'neon-purple',
        title: 'Refinements 💜',
        content: '• Fine-tune the neon glow\n• Ergonomic thumb zones\n• Micro-interactions',
      },
      {
        id: generateId(),
        type: 'note',
        x: 660,
        y: 100,
        width: 240,
        height: 170,
        zIndex: 3,
        createdAt: Date.now(),
        color: 'neon-cyan',
        title: 'Production Ready 💎',
        content: '• 60fps animations\n• Zero-slop discipline\n• Full responsiveness',
      },
    ],
  },
];
