import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Bot, 
  Users, 
  Zap, 
  Shield, 
  Flame, 
  Sparkles, 
  ArrowLeft, 
  Sliders, 
  Play, 
  Gamepad2, 
  Clock, 
  Coins, 
  Radio, 
  X,
  Target,
  Search,
  Wifi,
  Lock,
  Rocket,
  CircleDot,
  Check,
  AlertTriangle
} from 'lucide-react';
import { PlayerProfile } from './types.ts';
import { EncartoArena } from './game/EncartoArena.tsx';
import { GameMode } from './game/config/arenaConfig.ts';
import { BotDifficulty } from './game/ai/botConfig.ts';
import PvpStuntBikeRacing from './PvpStuntBikeRacing.tsx';
import PvpCarRacing from './PvpCarRacing.tsx';
import PvpChess from './PvpChess.tsx';
import PvpCheckers from './PvpCheckers.tsx';
import { useToast } from './ToastContext.tsx';
import { triggerHaptic } from './haptics.ts';
import { MatchVictoryModal } from './MatchVictoryModal.tsx';

interface ArenaGameHubProps {
  profile: PlayerProfile;
  onBackToMain?: () => void;
}

export interface ArenaGameCard {
  id: string;
  title: string;
  genre: string;
  badge: string;
  rating: number;
  playersCount: string;
  description: string;
  playable: boolean;
  gameType: 'encarto-arena' | 'bike' | 'car' | 'chess' | 'checkers' | 'fps-teaser' | 'space-teaser';
  defaultMode: 'bot' | 'pvp';
  supportedModes: string[];
  features: string[];
}

const ARENA_GAMES: ArenaGameCard[] = [
  {
    id: 'encarto-mecha-strike',
    title: 'Encarto Mecha Strike',
    genre: 'Action Battle Arena',
    badge: 'FEATURED ACTION',
    rating: 4.9,
    playersCount: '2.8k Battling',
    description: 'Cyberpunk top-down mecha arena combat with high-speed dash dodges, plasma blade slashes, EMP shockwaves, and bot or PvP multiplayer.',
    playable: true,
    gameType: 'encarto-arena',
    defaultMode: 'bot',
    supportedModes: ['1v1 Bot Duel', 'Horde Skirmish', 'Target Dummy', 'Online PvP Queue'],
    features: ['Canvas 2D Combat', 'Adaptive AI Bots', 'Combo Multiplier', 'Zero Latency Netcode']
  },
  {
    id: 'cyber-stunt-bike',
    title: 'Cyber Stunt Bike Trials',
    genre: 'Physics Trials & Stunts',
    badge: 'HIGH STAKES',
    rating: 4.7,
    playersCount: '950 Racers',
    description: 'Acrobatic neon trials across cyberpunk ramps and loops. Pull off backflips, 360-spins, and build your combo multiplier against rival racers.',
    playable: true,
    gameType: 'bike',
    defaultMode: 'bot',
    supportedModes: ['Ghost Bot Time Trial', '1v1 PvP Duel', 'High Roller Wagers'],
    features: ['Physics Stunt Engine', 'Multiplier Combos', 'Real-time Wagers']
  },
  {
    id: 'neon-hypercar-gp',
    title: 'Neon Hypercar Grand Prix',
    genre: 'Cyber Circuit Racing',
    badge: 'POPULAR RACER',
    rating: 4.8,
    playersCount: '1.2k Racers',
    description: 'Slipstream drafting and high-speed drift battles through glowing neo-Tokyo circuits. Grab nitro refills and overtake the AI or online rivals.',
    playable: true,
    gameType: 'car',
    defaultMode: 'bot',
    supportedModes: ['AI Circuit Grand Prix', 'PvP Head-to-Head', 'Speed Drift Duel'],
    features: ['Nitro Boost System', 'Traffic Hazard Avoidance', 'Split-Second Finishes']
  },
  {
    id: 'quantum-cyber-chess',
    title: 'Quantum Cyber Chess',
    genre: 'Tactical Mind Duel',
    badge: 'ELO RATED',
    rating: 4.9,
    playersCount: '1.5k Thinking',
    description: 'Holographic cyberpunk chess with interactive chess clocks, legal move visualizers, AI sparring partners, and ranked competitive wagering.',
    playable: true,
    gameType: 'chess',
    defaultMode: 'bot',
    supportedModes: ['Neural AI Bot Spar', 'Ranked 5-Min Blitz', 'M3GA High Wagers'],
    features: ['Legal Move Analysis', 'Interactive Clock Timers', 'Official Elo Ladder']
  },
  {
    id: 'cyber-checkers-strike',
    title: 'Cyber Checkers Strike',
    genre: 'Arcade Tactics',
    badge: 'RAPID BLITZ',
    rating: 4.6,
    playersCount: '780 Playing',
    description: 'Fast-paced tactical jumping, double-hop chain combos, king piece promotions, and intense rapid-fire blitz duels.',
    playable: true,
    gameType: 'checkers',
    defaultMode: 'bot',
    supportedModes: ['AI Bot Blitz', '1v1 Room Challenge', 'Casual Free-Play'],
    features: ['Instant Matchmaking', 'Chain-Jump Highlights', 'Tactical Promotions']
  },
  {
    id: 'titan-strike-fps',
    title: 'Titan Strike: Corridor Ops',
    genre: 'Tactical Cyber FPS',
    badge: 'COMING SOON',
    rating: 5.0,
    playersCount: '14.8k Wishlists',
    description: 'Next-generation tactical corridor FPS featuring modular rail weapons, thermal radar sweeps, and mecha titan deployment. Beta registration open.',
    playable: false,
    gameType: 'fps-teaser',
    defaultMode: 'pvp',
    supportedModes: ['5v5 Demolition', 'Titan Escort', 'Solo Deathmatch'],
    features: ['In Active Development', 'Unreal Weapon Feel', 'Beta Invites Dropping Soon']
  },
  {
    id: 'valkyrie-void-dogfight',
    title: 'Valkyrie Void Dogfight',
    genre: '6-DOF Space Skirmish',
    badge: 'COMING SOON',
    rating: 4.9,
    playersCount: '8.4k Wishlists',
    description: 'Zero-gravity starfighter dogfights through shattered asteroid fields and planetary defense stations. Customizable thrusters and missile racks.',
    playable: false,
    gameType: 'space-teaser',
    defaultMode: 'pvp',
    supportedModes: ['Space Dogfight 3v3', 'Carrier Assault', 'Flight Simulation'],
    features: ['In Active Development', 'Full 3D Space Physics', 'Alpha Access Q3']
  }
];

// SVG Gradient Cover Art for each game (Zero external images for peak performance)
const GameCoverArtwork: React.FC<{ gameId: string; playable: boolean }> = ({ gameId, playable }) => {
  switch (gameId) {
    case 'encarto-mecha-strike':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#2a0845] via-[#140b2e] to-[#07051a] overflow-hidden flex items-center justify-center">
          {/* Cyber Hexagon & Grid Background */}
          <svg className="w-full h-full opacity-60" viewBox="0 0 320 180" fill="none">
            <defs>
              <pattern id="hex-strike" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M12 0 L24 6.9 L24 20.7 L12 27.6 L0 20.7 L0 6.9 Z" stroke="#a855f7" strokeWidth="0.75" strokeOpacity="0.25" fill="none" />
              </pattern>
              <radialGradient id="plasma-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#07051a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="180" fill="url(#hex-strike)" />
            <circle cx="160" cy="90" r="75" fill="url(#plasma-core)" />
            {/* Dual Plasma Blades Crossed */}
            <path d="M70 145 L150 90 L230 35 L245 42 L165 97 L85 152 Z" fill="url(#plasma-core)" stroke="#22d3ee" strokeWidth="1.5" />
            <path d="M250 145 L170 90 L90 35 L75 42 L155 97 L235 152 Z" fill="url(#plasma-core)" stroke="#c084fc" strokeWidth="1.5" />
            {/* Crosshair Target Rings */}
            <circle cx="160" cy="90" r="38" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="160" cy="90" r="20" stroke="#22d3ee" strokeWidth="2" />
            <line x1="160" y1="40" x2="160" y2="60" stroke="#c084fc" strokeWidth="2" />
            <line x1="160" y1="120" x2="160" y2="140" stroke="#c084fc" strokeWidth="2" />
            <line x1="110" y1="90" x2="130" y2="90" stroke="#c084fc" strokeWidth="2" />
            <line x1="190" y1="90" x2="210" y2="90" stroke="#c084fc" strokeWidth="2" />
            <circle cx="160" cy="90" r="4" fill="#22d3ee" />
          </svg>
        </div>
      );

    case 'cyber-stunt-bike':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#0c2240] via-[#0d1233] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 180" fill="none">
            <defs>
              <linearGradient id="ramp-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Speed Waves */}
            <path d="M-20 150 C70 150 120 110 160 70 C200 30 250 15 340 10" stroke="url(#ramp-grad)" strokeWidth="3" fill="none" />
            <path d="M-20 165 C80 165 140 125 180 85 C220 45 270 30 340 25" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeDasharray="8 6" />
            {/* Stunt Bike Wireframe */}
            <g transform="translate(145, 45) rotate(-22)">
              {/* Wheels */}
              <circle cx="0" cy="20" r="14" stroke="#22d3ee" strokeWidth="2.5" fill="#07051a" />
              <circle cx="0" cy="20" r="6" fill="#c084fc" />
              <circle cx="50" cy="20" r="14" stroke="#22d3ee" strokeWidth="2.5" fill="#07051a" />
              <circle cx="50" cy="20" r="6" fill="#c084fc" />
              {/* Chassis Frame */}
              <path d="M0 20 L25 5 L50 20 L30 18 L15 10 Z" stroke="#a855f7" strokeWidth="2.5" fill="none" />
              <path d="M25 5 L35 -8 L42 -6" stroke="#22d3ee" strokeWidth="2" fill="none" />
              {/* Stunt Sparks */}
              <circle cx="-10" cy="28" r="1.5" fill="#22d3ee" />
              <circle cx="-18" cy="34" r="2" fill="#c084fc" />
              <circle cx="-5" cy="38" r="1" fill="#f5f3ff" />
            </g>
          </svg>
        </div>
      );

    case 'neon-hypercar-gp':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#3b082e] via-[#160a2b] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 180" fill="none">
            <defs>
              <linearGradient id="horizon-sun" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Perspective Grid Floor */}
            <path d="M160 55 L-20 180 M160 55 L30 180 M160 55 L80 180 M160 55 L130 180 M160 55 L160 180 M160 55 L190 180 M160 55 L240 180 M160 55 L290 180 M160 55 L340 180" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="20" y1="140" x2="300" y2="140" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="60" y1="105" x2="260" y2="105" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="110" y1="75" x2="210" y2="75" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.25" />
            {/* Distant Cyber Sun */}
            <circle cx="160" cy="55" r="28" fill="url(#horizon-sun)" opacity="0.6" />
            {/* Hypercar Silhouette & Light Trails */}
            <g transform="translate(100, 80)">
              <path d="M10 32 Q60 10 110 32 L116 42 Q60 38 4 42 Z" fill="#0b0b2b" stroke="#22d3ee" strokeWidth="2" />
              <path d="M25 24 Q60 12 95 24" stroke="#c084fc" strokeWidth="2.5" fill="none" />
              {/* Twin Red Neon Taillight Streaks */}
              <line x1="15" y1="36" x2="-35" y2="36" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
              <line x1="105" y1="36" x2="155" y2="36" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              {/* Underglow Cyan Aura */}
              <ellipse cx="60" cy="42" rx="45" ry="6" fill="#22d3ee" opacity="0.45" />
            </g>
          </svg>
        </div>
      );

    case 'quantum-cyber-chess':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1a124a] via-[#0d0929] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 180" fill="none">
            {/* Isometric Chessboard */}
            <g transform="translate(160, 115) scale(1, 0.58) rotate(45)">
              <rect x="-60" y="-60" width="120" height="120" stroke="#3b82f6" strokeWidth="1.5" fill="#0b0b2b" />
              <rect x="-60" y="-60" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="0" y="-60" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="-30" y="-30" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="30" y="-30" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="-60" y="0" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="0" y="0" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="-30" y="30" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
              <rect x="30" y="30" width="30" height="30" fill="#a855f7" fillOpacity="0.4" />
            </g>
            {/* Holographic King Piece */}
            <g transform="translate(160, 48)">
              <path d="M-12 36 L12 36 L8 12 L14 4 L6 6 L0 -6 L-6 6 L-14 4 L-8 12 Z" stroke="#22d3ee" strokeWidth="2" fill="#a855f7" fillOpacity="0.3" />
              <circle cx="0" cy="-10" r="3" fill="#22d3ee" />
              <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#22d3ee" strokeWidth="1.5" />
              {/* Quantum Holo Nodes */}
              <circle cx="-35" cy="20" r="4" stroke="#c084fc" strokeWidth="1.5" />
              <circle cx="35" cy="20" r="4" stroke="#c084fc" strokeWidth="1.5" />
              <line x1="-31" y1="20" x2="-12" y2="30" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="31" y1="20" x2="12" y2="30" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          </svg>
        </div>
      );

    case 'cyber-checkers-strike':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#250d3d] via-[#110824] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 180" fill="none">
            {/* Matrix Circles & Jump Trajectory */}
            <path d="M80 120 Q160 30 240 120" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
            {/* Left Checkers Disc */}
            <ellipse cx="80" cy="120" rx="26" ry="12" fill="#0b0b2b" stroke="#a855f7" strokeWidth="2" />
            <ellipse cx="80" cy="116" rx="22" ry="9" fill="#a855f7" fillOpacity="0.5" stroke="#c084fc" strokeWidth="1.5" />
            {/* Jump Crown Piece on Right */}
            <ellipse cx="240" cy="120" rx="26" ry="12" fill="#0b0b2b" stroke="#22d3ee" strokeWidth="2" />
            <ellipse cx="240" cy="114" rx="24" ry="10" fill="#3b82f6" fillOpacity="0.4" stroke="#22d3ee" strokeWidth="1.5" />
            <ellipse cx="240" cy="108" rx="20" ry="8" fill="#22d3ee" fillOpacity="0.6" stroke="#f5f3ff" strokeWidth="1.5" />
            <polygon points="236,92 240,86 244,92 248,88 245,98 235,98 232,88" fill="#f5f3ff" />
          </svg>
        </div>
      );

    case 'titan-strike-fps':
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1c1917] via-[#120f1d] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full opacity-50" viewBox="0 0 320 180" fill="none">
            {/* Tactical Radar Sweep */}
            <circle cx="160" cy="90" r="60" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.4" />
            <circle cx="160" cy="90" r="40" stroke="#71717a" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="160" cy="90" r="16" stroke="#22d3ee" strokeWidth="1" />
            {/* Reticle Brackets */}
            <path d="M140 70 L140 60 L150 60" stroke="#f43f5e" strokeWidth="2" />
            <path d="M180 70 L180 60 L170 60" stroke="#f43f5e" strokeWidth="2" />
            <path d="M140 110 L140 120 L150 120" stroke="#f43f5e" strokeWidth="2" />
            <path d="M180 110 L180 120 L170 120" stroke="#f43f5e" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'valkyrie-void-dogfight':
    default:
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#0c1829] via-[#090d1f] to-[#07051a] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full opacity-50" viewBox="0 0 320 180" fill="none">
            {/* Starfield & Orbital Flight Vector */}
            <circle cx="60" cy="40" r="1.5" fill="#f5f3ff" />
            <circle cx="110" cy="80" r="2" fill="#22d3ee" />
            <circle cx="260" cy="50" r="1.5" fill="#f5f3ff" />
            <circle cx="280" cy="140" r="2" fill="#c084fc" />
            <circle cx="40" cy="150" r="1" fill="#f5f3ff" />
            {/* Starfighter Silhouette */}
            <path d="M160 50 L180 110 L160 98 L140 110 Z" stroke="#3b82f6" strokeWidth="2" fill="#0b0b2b" />
            <line x1="160" y1="100" x2="160" y2="135" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
};

export const ArenaGameHub: React.FC<ArenaGameHubProps> = ({ profile, onBackToMain }) => {
  // Hub Filter State
  const [activeCategory, setActiveCategory] = useState<'all' | 'action' | 'racing' | 'strategy' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Game for Setup Modal
  const [selectedGameForSetup, setSelectedGameForSetup] = useState<ArenaGameCard | null>(null);

  // Configuration Setup Options
  const [setupModeType, setSetupModeType] = useState<'bot' | 'pvp'>('bot');
  const [botMode, setBotMode] = useState<GameMode>('BOT_DUEL');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('NORMAL');
  const [botCount, setBotCount] = useState<number>(1);
  const [matchDuration, setMatchDuration] = useState<number>(120);
  const [pilotPerk, setPilotPerk] = useState<'plasma' | 'overdrive' | 'shield' | 'emp'>('plasma');
  const [pvpStake, setPvpStake] = useState<number>(0);
  const [pvpServer, setPvpServer] = useState<string>('eu-central');
  const { toast } = useToast();
  const [victoryModalData, setVictoryModalData] = useState<{
    isOpen: boolean;
    gameTitle: string;
    score: number;
    xpEarned: number;
    coinsEarned: number;
    botsNeutralized: number;
    damageDealt: number;
    modeLabel: string;
  } | null>(null);

  // 3-2-1 Countdown Animation State
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Active Running Game Session
  const [activeRunningGame, setActiveRunningGame] = useState<{
    card: ArenaGameCard;
    isPvP: boolean;
    botMode: GameMode;
    botDifficulty: BotDifficulty;
    botCount: number;
    wager: number;
  } | null>(null);

  // Handle 3-2-1 countdown loop
  useEffect(() => {
    if (countdownValue === null) return;

    if (countdownValue > 0) {
      triggerHaptic('heavy');
      const timer = setTimeout(() => {
        setCountdownValue(prev => (prev !== null ? prev - 1 : null));
      }, 950);
      return () => clearTimeout(timer);
    } else if (countdownValue === 0) {
      triggerHaptic('success');
      toast.win("Match Initiated!", "Entering cyber-stadium combat matrix.");
      const launchTimer = setTimeout(() => {
        setCountdownValue(null);
        handleLaunchMatchDirect();
      }, 700);
      return () => clearTimeout(launchTimer);
    }
  }, [countdownValue]);

  const handleOpenSetup = (game: ArenaGameCard) => {
    if (!game.playable) {
      triggerHaptic('light');
      toast.info(`Early Access Clearance`, `Registered interest for ${game.title}! Beta notify clearance granted.`);
      return;
    }
    triggerHaptic('medium');
    setSelectedGameForSetup(game);
    setSetupModeType(game.defaultMode);
    setCountdownValue(null);
  };

  const handleStartCountdown = () => {
    if (!selectedGameForSetup) return;
    triggerHaptic('heavy');
    setCountdownValue(3);
  };

  const handleAbortCountdown = () => {
    triggerHaptic('light');
    setCountdownValue(null);
  };

  const handleGenericGameOver = (gameTitle: string, won: boolean, stats?: any) => {
    if (won) {
      setVictoryModalData({
        isOpen: true,
        gameTitle,
        score: stats?.score || 3200,
        xpEarned: 180,
        coinsEarned: 40,
        botsNeutralized: 1,
        damageDealt: 950,
        modeLabel: 'Championship Match'
      });
      toast.win(`Victory in ${gameTitle}!`, "+180 XP and +40 M3GA coins credited.");
    } else {
      toast.error(`Match Ended`, `Tactical match in ${gameTitle} concluded.`);
    }
  };

  const handleLaunchMatchDirect = () => {
    if (!selectedGameForSetup) return;
    setActiveRunningGame({
      card: selectedGameForSetup,
      isPvP: setupModeType === 'pvp',
      botMode,
      botDifficulty,
      botCount,
      wager: pvpStake
    });
    setSelectedGameForSetup(null);
    setCountdownValue(null);
  };

  const handleReturnToHub = () => {
    setActiveRunningGame(null);
  };

  // Filtered Game Cards
  const filteredGames = ARENA_GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'action') return game.genre.includes('Action') || game.genre.includes('Battle');
    if (activeCategory === 'racing') return game.genre.includes('Racing') || game.genre.includes('Trials');
    if (activeCategory === 'strategy') return game.genre.includes('Tactical') || game.genre.includes('Mind') || game.genre.includes('Tactics');
    if (activeCategory === 'upcoming') return !game.playable;
    return true;
  });

  // If a game is currently running, render that specific game with an intuitive return header
  if (activeRunningGame) {
    const { card, isPvP, botMode: activeBotMode, botDifficulty: activeDifficulty, botCount: activeBotCount, wager } = activeRunningGame;
    
    return (
      <div className="flex flex-col h-full max-w-7xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
        {/* Game Active Session Navigation Bar */}
        <div className="glass-panel px-4 sm:px-6 py-3 rounded-2xl border border-purple-400/40 flex flex-wrap items-center justify-between gap-3 bg-[#0b0b2b]/95 shadow-[0_0_25px_rgba(168,85,247,0.35)]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturnToHub}
              className="px-4 py-2 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-purple-400/50 hover:border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 group cursor-pointer"
            >
              <ArrowLeft size={16} className="text-purple-300 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Games Hub</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-purple-500/30" />
            <div>
              <h3 className="font-heading text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <span>{card.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-cyan-300 border border-purple-400/40">
                  {isPvP ? '⚡ LIVE PVP MATCH' : `🤖 BOT ${activeDifficulty}`}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                handleReturnToHub();
                setTimeout(() => handleOpenSetup(card), 50);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-400/40 text-purple-200 hover:text-white hover:border-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change match rules, difficulty or mode"
            >
              <Sliders size={14} className="text-purple-300" />
              <span>Change Setup</span>
            </button>
            <div className="px-3 py-1 bg-purple-950/90 border border-cyan-400/40 rounded-xl text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <CircleDot size={12} className="text-green-400 animate-pulse" />
              <span>Pilot: {profile.name}</span>
            </div>
          </div>
        </div>

        {/* Game Render Area */}
        <div className="flex-grow">
          {card.gameType === 'encarto-arena' && (
            <EncartoArena
              onBackToHub={handleReturnToHub}
              playerName={profile.name}
              initialOnline={isPvP}
              initialMode={activeBotMode}
              initialDifficulty={activeDifficulty}
              initialBotCount={activeBotCount}
            />
          )}
          {card.gameType === 'bike' && (
            <div className="h-[75vh] w-full">
              <PvpStuntBikeRacing
                wager={wager}
                opponent={isPvP ? 'Online Challenger' : `GhostBot-${activeDifficulty}`}
                onGameOver={(won?: any) => handleGenericGameOver(card.title, typeof won === 'boolean' ? won : true)}
              />
            </div>
          )}
          {card.gameType === 'car' && (
            <div className="h-[75vh] w-full">
              <PvpCarRacing
                wager={wager}
                opponent={isPvP ? 'SpeedRival-X' : `CircuitAI-${activeDifficulty}`}
                onGameOver={(won?: any) => handleGenericGameOver(card.title, typeof won === 'boolean' ? won : true)}
              />
            </div>
          )}
          {card.gameType === 'chess' && (
            <div className="h-[75vh] w-full">
              <PvpChess
                wager={wager}
                opponent={isPvP ? 'Grandmaster-Pilot' : `ChessBot-${activeDifficulty}`}
                onGameOver={(won?: any) => handleGenericGameOver(card.title, typeof won === 'boolean' ? won : true)}
              />
            </div>
          )}
          {card.gameType === 'checkers' && (
            <div className="h-[75vh] w-full">
              <PvpCheckers
                wager={wager}
                opponent={isPvP ? 'Tactics-Master' : `CheckersAI-${activeDifficulty}`}
                onGameOver={(won?: any) => handleGenericGameOver(card.title, typeof won === 'boolean' ? won : true)}
              />
            </div>
          )}
        </div>

        {/* Match Victory Overlay (Confetti removed from DOM after 3 seconds) */}
        {victoryModalData && (
          <MatchVictoryModal
            isOpen={victoryModalData.isOpen}
            onClose={() => {
              setVictoryModalData(null);
              handleReturnToHub();
            }}
            onRematch={() => {
              setVictoryModalData(null);
              handleLaunchMatchDirect();
            }}
            gameTitle={victoryModalData.gameTitle}
            score={victoryModalData.score}
            xpEarned={victoryModalData.xpEarned}
            coinsEarned={victoryModalData.coinsEarned}
            botsNeutralized={victoryModalData.botsNeutralized}
            damageDealt={victoryModalData.damageDealt}
            modeLabel={victoryModalData.modeLabel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Match Victory Modal when invoked in Hub */}
      {victoryModalData && (
        <MatchVictoryModal
          isOpen={victoryModalData.isOpen}
          onClose={() => setVictoryModalData(null)}
          onRematch={() => setVictoryModalData(null)}
          gameTitle={victoryModalData.gameTitle}
          score={victoryModalData.score}
          xpEarned={victoryModalData.xpEarned}
          coinsEarned={victoryModalData.coinsEarned}
          botsNeutralized={victoryModalData.botsNeutralized}
          damageDealt={victoryModalData.damageDealt}
          modeLabel={victoryModalData.modeLabel}
        />
      )}

      {/* Cyber Hero Header */}
      <div className="cyber-card p-6 sm:p-8 rounded-[24px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-black uppercase tracking-widest text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)] flex items-center gap-1.5">
                <Swords size={12} className="text-cyan-300" /> ARENA COMBAT HUB
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-widest">Select Card & Configure</span>
            </div>
            
            <h1 className="font-heading text-3xl sm:text-5xl text-white uppercase tracking-tight">
              ENCARTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 text-glow-purple">ARENA</span>
            </h1>
            
            <p className="text-sm text-[#a5b4fc] font-medium leading-relaxed">
              Launch top-tier cyber esports titles. Choose a game card below to customize bot difficulty, count, and duration for solo practice, or join the live PvP wager queue.
            </p>
          </div>

          {/* Quick Pilot Readiness Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-[#07051a]/80 min-w-[240px] shadow-[0_0_20px_rgba(7,5,26,0.8)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Active Pilot</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-400/40">
                Rank {profile.rank}
              </span>
            </div>
            <div>
              <p className="text-lg font-black text-white uppercase tracking-tight">{profile.name}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a5b4fc] mt-0.5">
                <Coins size={14} className="text-cyan-300" />
                <span className="font-bold text-white">{profile.balance.toFixed(2)} M3GA</span>
              </div>
            </div>
            <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-purple-300/80">
              <span className="flex items-center gap-1">
                <Wifi size={12} className="text-green-400" /> Ping: 18ms
              </span>
              <span className="text-cyan-300 font-bold uppercase">Ready to Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All Titles' },
            { id: 'action', label: 'Action & Combat' },
            { id: 'racing', label: 'Racing & Trials' },
            { id: 'strategy', label: 'Tactical Mind' },
            { id: 'upcoming', label: 'Upcoming' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.5)]'
                  : 'bg-[#0b0b2b]/70 text-[#a5b4fc] hover:text-white hover:bg-purple-950/50 border border-purple-500/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search arena games..."
            className="w-full pl-10 pr-4 py-2 bg-[#0b0b2b]/80 border border-purple-500/30 rounded-xl text-xs text-white placeholder-purple-400/50 focus:border-purple-300 focus:outline-none shadow-inner"
          />
        </div>
      </div>

      {/* GAME CARDS RESPONSIVE GRID: 1 col mobile, 2 tablet, 3 to 4 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredGames.map((game, index) => {
          return (
            <div
              key={game.id}
              onClick={() => handleOpenSetup(game)}
              style={{ animationDelay: `${index * 55}ms` }}
              className={`arena-card-anim arena-card-hover rounded-[16px] border flex flex-col overflow-hidden group cursor-pointer relative bg-[#0b0b2b]/90 backdrop-blur-sm ${
                game.playable
                  ? 'border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.45)]'
                  : 'border-purple-500/20 opacity-70 hover:opacity-85'
              }`}
            >
              {/* Coming soon cards: shimmer sweep animation overlay */}
              {!game.playable && (
                <div className="shimmer-loop" />
              )}

              {/* Card Gradient Cover (CSS / Inline SVG, No Images) */}
              <div className="relative h-44 w-full overflow-hidden border-b border-purple-500/20">
                <GameCoverArtwork gameId={game.id} playable={game.playable} />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shadow-md flex items-center gap-1 ${
                    game.playable 
                      ? 'bg-[#07051a]/90 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'bg-zinc-950/90 text-purple-300 border-purple-500/40'
                  }`}>
                    {!game.playable && <Lock size={10} className="text-purple-400" />}
                    {game.badge}
                  </span>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 border border-purple-400/30 text-[10px] font-bold text-yellow-300">
                    <span className="text-yellow-400">★</span>
                    <span>{game.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Player count badge */}
                <div className="absolute bottom-2.5 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/70 px-2.5 py-0.5 rounded-md border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
                    <Users size={12} className="text-cyan-300" />
                    <span>{game.playersCount}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3.5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a5b4fc]">
                    {game.genre}
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl text-white uppercase tracking-tight group-hover:text-purple-200 transition-colors mt-0.5">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[#a5b4fc]/80 font-normal line-clamp-2 mt-1 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Supported Modes Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {game.supportedModes.slice(0, 2).map((mode, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-200 border border-purple-500/25"
                    >
                      {mode}
                    </span>
                  ))}
                </div>

                {/* Distinct "PLAY" Button */}
                <div className="pt-2 border-t border-purple-500/20">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      game.playable
                        ? 'cyber-btn shadow-[0_0_18px_rgba(168,85,247,0.45)] group-hover:shadow-[0_0_24px_rgba(192,132,252,0.65)]'
                        : 'bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:bg-purple-900/40'
                    }`}
                  >
                    {game.playable ? (
                      <>
                        <Play size={14} className="fill-white" />
                        <span>PLAY</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} className="text-purple-300" />
                        <span>COMING SOON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRE-MATCH SETUP MODAL (Centered Modal on Desktop, Full-height Bottom Sheet on Mobile with Spring Entrance) */}
      {selectedGameForSetup && (
        <div className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl max-h-[94vh] sm:max-h-[90vh] h-full sm:h-auto rounded-t-[28px] sm:rounded-[24px] sheet-spring-slide sm:modal-spring-scale border border-purple-500/40 bg-[#07051a] shadow-[0_0_60px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden relative">
            
            {/* Mobile Sheet Drag Handle Bar */}
            <div className="w-12 h-1.5 rounded-full bg-purple-400/40 mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-purple-500/20 flex items-center justify-between shrink-0 bg-[#0b0b2b]/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-900/50 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] text-cyan-300">
                  <Gamepad2 size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 block">Match Setup Console</span>
                  <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                    {selectedGameForSetup.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => {
                  if (countdownValue === null) setSelectedGameForSetup(null);
                  else handleAbortCountdown();
                }}
                className="p-2 rounded-full bg-[#0b0b2b] hover:bg-purple-900/60 text-[#a5b4fc] hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
                title="Close setup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
              
              {/* TWO BIG TOGGLE TABS: "Bot Practice" and "Live PvP" with sliding gradient pill indicator */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#a5b4fc] mb-2 block">
                  Select Arena Category
                </label>
                <div className="relative p-1.5 rounded-2xl bg-[#0b0b2b] border border-purple-500/30 flex">
                  {/* Sliding Gradient Pill Indicator */}
                  <div 
                    className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300 ease-out"
                    style={{
                      left: setupModeType === 'bot' ? '6px' : 'calc(50% + 3px)',
                      width: 'calc(50% - 9px)'
                    }}
                  />

                  {/* Bot Practice Tab */}
                  <button
                    type="button"
                    onClick={() => setSetupModeType('bot')}
                    className={`relative z-10 flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      setupModeType === 'bot' ? 'text-white' : 'text-[#a5b4fc] hover:text-white'
                    }`}
                  >
                    <Bot size={16} className={setupModeType === 'bot' ? 'text-cyan-300' : 'text-purple-300'} />
                    <span>Bot Practice</span>
                  </button>

                  {/* Live PvP Tab */}
                  <button
                    type="button"
                    onClick={() => setSetupModeType('pvp')}
                    className={`relative z-10 flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      setupModeType === 'pvp' ? 'text-white' : 'text-[#a5b4fc] hover:text-white'
                    }`}
                  >
                    <Users size={16} className={setupModeType === 'pvp' ? 'text-cyan-300' : 'text-purple-300'} />
                    <span>Live PvP</span>
                  </button>
                </div>
              </div>

              {/* BOT PRACTICE CONTROLS */}
              {setupModeType === 'bot' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Mode / Format Segmented Control */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2.5 block flex items-center gap-2">
                      <Target size={14} className="text-cyan-300" /> Match Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'BOT_DUEL', label: '1v1 Bot Duel', desc: '1v1 adaptive AI sparring' },
                        { id: 'BOT_SKIRMISH', label: 'Horde Skirmish', desc: 'Multi-target combat waves' },
                        { id: 'PRACTICE_DUMMY', label: 'Target Dummy', desc: 'Combo testing & telemetry' }
                      ].map(mode => {
                        const isSelected = botMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setBotMode(mode.id as GameMode)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-900/50 border-purple-400 text-white shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                                : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase">{mode.label}</p>
                              {isSelected && <Check size={14} className="text-cyan-300" />}
                            </div>
                            <p className="text-[10px] text-[#a5b4fc]/80 mt-1">{mode.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty Segmented Control (Glows when selected) */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2.5 block flex items-center gap-2">
                      <Sliders size={14} className="text-cyan-300" /> Bot AI Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'EASY', label: 'Recruit', color: 'text-green-400', glow: 'shadow-[0_0_16px_rgba(74,222,128,0.4)] border-green-400', desc: 'Standard reaction speed' },
                        { id: 'NORMAL', label: 'Combat Agent', color: 'text-yellow-300', glow: 'shadow-[0_0_16px_rgba(253,224,71,0.4)] border-yellow-300', desc: 'Active dodging & counters' },
                        { id: 'HARD', label: 'Apex Cyber', color: 'text-red-400', glow: 'shadow-[0_0_16px_rgba(248,113,113,0.4)] border-red-400', desc: 'Instant reflexes & combo chaining' }
                      ].map(diff => {
                        const isSelected = botDifficulty === diff.id;
                        return (
                          <button
                            key={diff.id}
                            type="button"
                            onClick={() => setBotDifficulty(diff.id as BotDifficulty)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? `bg-purple-900/60 ${diff.glow} text-white`
                                : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40 hover:text-white'
                            }`}
                          >
                            <p className={`text-xs font-black uppercase ${diff.color}`}>{diff.label}</p>
                            <p className="text-[9px] text-[#a5b4fc]/70 mt-0.5">{diff.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bot Count & Match Duration Chip Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bot Count Chips */}
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2 block">
                        Bot Count
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(count => {
                          const isSelected = botCount === count;
                          return (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setBotCount(count)}
                              className={`py-2.5 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                                  : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40'
                              }`}
                            >
                              {count} {count === 1 ? 'Bot' : 'Bots'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Match Duration Chips */}
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2 block flex items-center gap-1.5">
                        <Clock size={12} className="text-cyan-300" /> Match Duration
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { sec: 60, label: '60s' },
                          { sec: 120, label: '120s' },
                          { sec: 180, label: '180s' }
                        ].map(d => {
                          const isSelected = matchDuration === d.sec;
                          return (
                            <button
                              key={d.sec}
                              type="button"
                              onClick={() => setMatchDuration(d.sec)}
                              className={`py-2.5 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                                  : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LOADOUT PERKS: Selectable cards with icons and a pulsing selection ring */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2 block flex items-center gap-1.5">
                      <Zap size={14} className="text-cyan-300" /> Loadout Perk (Selectable with Pulsing Ring)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { 
                          id: 'plasma', 
                          label: 'Plasma Blade', 
                          icon: Swords, 
                          desc: 'Dual beam slash + projectile wave' 
                        },
                        { 
                          id: 'overdrive', 
                          label: 'Overdrive', 
                          icon: Flame, 
                          desc: 'Dash cooldown reduced 25%' 
                        },
                        { 
                          id: 'shield', 
                          label: 'Kinetic Shield', 
                          icon: Shield, 
                          desc: 'Absorbs 35 burst damage' 
                        },
                        { 
                          id: 'emp', 
                          label: 'Quantum EMP', 
                          icon: Radio, 
                          desc: 'Stuns rival AI bots for 2.5s' 
                        }
                      ].map(perk => {
                        const isSelected = pilotPerk === perk.id;
                        const IconComponent = perk.icon;
                        return (
                          <button
                            key={perk.id}
                            type="button"
                            onClick={() => setPilotPerk(perk.id as any)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-purple-900/60 border-cyan-400 text-white pulse-ring-active'
                                : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-purple-950 text-purple-300'}`}>
                                <IconComponent size={16} />
                              </div>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                              )}
                            </div>
                            <p className="text-xs font-black uppercase tracking-tight">{perk.label}</p>
                            <p className="text-[9px] text-[#a5b4fc]/70 mt-0.5 line-clamp-2 leading-tight">{perk.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE PVP CONTROLS */}
              {setupModeType === 'pvp' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 flex items-start gap-3">
                    <Radio size={20} className="text-cyan-300 mt-0.5 animate-pulse shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-cyan-200 tracking-wider">Live Online Matchmaking</h4>
                      <p className="text-[11px] text-[#a5b4fc] mt-0.5">
                        Queues with verified network sync and wager escrow. Winner claims match stake minus 2% host burn fee.
                      </p>
                    </div>
                  </div>

                  {/* Wager Stake Chips */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2.5 block flex items-center gap-1.5">
                      <Coins size={14} className="text-cyan-300" /> Match Wager Stake
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { stake: 0, label: 'Casual Scrim', cost: '0 M3GA' },
                        { stake: 10, label: 'Ranked Duel', cost: '10 M3GA' },
                        { stake: 25, label: 'High Roller', cost: '25 M3GA' }
                      ].map(w => {
                        const isSelected = pvpStake === w.stake;
                        return (
                          <button
                            key={w.stake}
                            type="button"
                            onClick={() => setPvpStake(w.stake)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-900/60 border-cyan-400 text-white shadow-[0_0_18px_rgba(34,211,238,0.45)]'
                                : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40 hover:text-white'
                            }`}
                          >
                            <p className="text-xs font-black uppercase">{w.label}</p>
                            <p className="text-[10px] text-cyan-300 font-mono mt-0.5">{w.cost}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Server Region Chips */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2 block flex items-center gap-1.5">
                      <Wifi size={14} className="text-green-400" /> Server Gateway
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'eu-central', label: 'Europe (Frankfurt)', ping: '18ms' },
                        { id: 'us-east', label: 'North America (Virginia)', ping: '38ms' }
                      ].map(s => {
                        const isSelected = pvpServer === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setPvpServer(s.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-900/60 border-purple-400 text-white shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                                : 'bg-[#0b0b2b]/70 border-purple-500/20 text-[#a5b4fc] hover:bg-purple-950/40 hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-black uppercase">{s.label}</span>
                            <span className="text-[10px] font-mono text-green-400">{s.ping}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STICKY BOTTOM "START MATCH" BUTTON WITH LOOPING SHIMMER */}
            <div className="sticky bottom-0 z-20 bg-[#07051a]/95 backdrop-blur-md p-4 sm:p-5 border-t border-purple-500/30 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (countdownValue === null) setSelectedGameForSetup(null);
                  else handleAbortCountdown();
                }}
                className="px-5 py-3.5 rounded-xl bg-[#0b0b2b] hover:bg-purple-900/40 text-[#a5b4fc] text-xs font-bold uppercase transition-colors cursor-pointer border border-purple-500/20"
              >
                {countdownValue !== null ? 'Abort' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleStartCountdown}
                disabled={countdownValue !== null}
                className="relative overflow-hidden flex-1 py-4 px-6 rounded-xl cyber-btn text-white font-black uppercase tracking-widest text-sm shadow-[0_0_28px_rgba(168,85,247,0.65)] hover:shadow-[0_0_36px_rgba(34,211,238,0.8)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {/* Looping shimmer on button */}
                <div className="shimmer-loop-btn" />

                <Play size={18} className="fill-white" />
                <span>START MATCH</span>
              </button>
            </div>

            {/* 3-2-1 COUNTDOWN OVERLAY ON CLICK */}
            {countdownValue !== null && (
              <div className="absolute inset-0 z-50 bg-[#07051a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="relative flex flex-col items-center">
                  {/* Glowing Radar Pulse Rings */}
                  <div className="absolute w-44 h-44 rounded-full border border-purple-500/40 animate-ping pointer-events-none" />
                  <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/50 animate-pulse pointer-events-none" />

                  {/* 3-2-1 Animated Digit */}
                  <div key={countdownValue} className="countdown-pop">
                    {countdownValue > 0 ? (
                      <span className="font-heading text-8xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-purple-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.9)]">
                        {countdownValue}
                      </span>
                    ) : (
                      <span className="font-heading text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.9)] uppercase">
                        ENGAGE!
                      </span>
                    )}
                  </div>

                  <p className="mt-6 text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                    <Rocket size={14} className="text-cyan-300 animate-bounce" />
                    <span>Synchronizing Combat Arena...</span>
                  </p>

                  <p className="text-[11px] text-[#a5b4fc] mt-1 font-mono">
                    Mode: {setupModeType === 'pvp' ? 'Online PvP Duel' : `${botDifficulty} AI (${botCount} Bot)`}
                  </p>

                  <button
                    type="button"
                    onClick={handleAbortCountdown}
                    className="mt-8 px-6 py-2.5 rounded-xl bg-purple-950/80 hover:bg-red-950/80 text-purple-300 hover:text-red-300 border border-purple-500/40 hover:border-red-400 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X size={14} />
                    <span>Abort Launch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArenaGameHub;
