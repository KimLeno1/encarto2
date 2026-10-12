import React, { useEffect, useRef, useState } from 'react';
import { 
  Swords, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Shield, 
  Zap, 
  Target, 
  Timer, 
  Flame, 
  Trophy, 
  MousePointer, 
  Sparkles,
  Info,
  Bot,
  Users,
  Crosshair,
  Skull,
  Award,
  Radio
} from 'lucide-react';
import { EncartoArenaGame } from './EncartoArenaGame.ts';
import { 
  PlayerHUDState, 
  DEFAULT_ARENA_CONFIG, 
  GameMode 
} from './config/arenaConfig.ts';
import { BotDifficulty } from './ai/botConfig.ts';
import { EncartoArenaOnline } from './EncartoArenaOnline.tsx';
import { api } from '../apiClient.ts';

interface EncartoArenaProps {
  onBackToHub: () => void;
  playerName?: string;
  initialOnline?: boolean;
}

export const EncartoArena: React.FC<EncartoArenaProps> = ({ onBackToHub, playerName = 'Pilot', initialOnline = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<EncartoArenaGame | null>(null);

  // Online PvP toggle
  const [isOnlinePvP, setIsOnlinePvP] = useState(initialOnline);

  // Selected game setup
  const [selectedMode, setSelectedMode] = useState<GameMode>('BOT_DUEL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('NORMAL');
  const [selectedBotCount, setSelectedBotCount] = useState<number>(1);

  const [hud, setHud] = useState<PlayerHUDState>({
    mode: 'BOT_DUEL',
    difficulty: 'NORMAL',
    botCount: 1,
    health: DEFAULT_ARENA_CONFIG.playerMaxHealth,
    maxHealth: DEFAULT_ARENA_CONFIG.playerMaxHealth,
    dummyHealth: DEFAULT_ARENA_CONFIG.dummyMaxHealth,
    dummyMaxHealth: DEFAULT_ARENA_CONFIG.dummyMaxHealth,
    opponents: [],
    attackReady: true,
    specialAttackReady: true,
    specialCooldownProgress: 1,
    dashReady: true,
    dashCooldownProgress: 1,
    matchTimeRemaining: DEFAULT_ARENA_CONFIG.matchDurationSeconds,
    status: 'PLAYING',
    stats: {
      score: 0,
      damageDealt: 0,
      damageTaken: 0,
      hitsLanded: 0,
      combosMax: 0,
      currentCombo: 0,
      botsDefeated: 0,
    },
  });

  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Bot Match Progression Tracking
  const currentBotMatchIdRef = useRef<string>(`bot-match-${Date.now()}`);
  const hasSubmittedRef = useRef<boolean>(false);
  const [matchProgressionResult, setMatchProgressionResult] = useState<any>(null);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // Authoritatively submit completed bot practice match for verified XP progression
  useEffect(() => {
    if (hud.status !== 'PLAYING' && selectedMode !== 'PRACTICE_DUMMY' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      setIsSubmittingMatch(true);
      api.completeBotMatch({
        matchId: currentBotMatchIdRef.current,
        gameType: 'arena',
        botDifficulty: selectedDifficulty,
        outcome: hud.status,
        score: hud.stats.score,
        damageDealt: hud.stats.damageDealt,
        botsDefeated: hud.stats.botsDefeated,
        durationSeconds: Math.max(1, 120 - hud.matchTimeRemaining),
      })
      .then((res) => {
        if (res?.result) {
          setMatchProgressionResult(res.result);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsSubmittingMatch(false);
      });
    }
  }, [hud.status, selectedMode, selectedDifficulty, hud.stats.score, hud.stats.damageDealt, hud.stats.botsDefeated, hud.matchTimeRemaining]);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new EncartoArenaGame();
    gameRef.current = game;
    game.init(
      containerRef.current,
      (newHud) => {
        setHud({ ...newHud });
      },
      {
        mode: selectedMode,
        difficulty: selectedDifficulty,
        botCount: selectedBotCount,
      }
    );

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleRestart = (
    mode: GameMode = selectedMode,
    diff: BotDifficulty = selectedDifficulty,
    count: number = selectedBotCount
  ) => {
    currentBotMatchIdRef.current = `bot-match-${Date.now()}`;
    hasSubmittedRef.current = false;
    setMatchProgressionResult(null);
    if (gameRef.current) {
      gameRef.current.restart(mode, diff, count);
    }
    setShowConfigDrawer(false);
  };

  const handleApplyConfig = (
    mode: GameMode,
    diff: BotDifficulty,
    count: number
  ) => {
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setSelectedBotCount(count);
    handleRestart(mode, diff, count);
  };

  const handleToggleMute = () => {
    if (gameRef.current) {
      const muted = gameRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Primary opponent for top health bar
  if (isOnlinePvP) {
    return (
      <div className="flex flex-col h-full space-y-2 animate-in fade-in">
        <div className="flex justify-between items-center glass-panel px-6 py-2.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setIsOnlinePvP(false)}
            className="text-xs font-black uppercase text-cyan-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Offline Practice / Bot Arena
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider text-green-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Online Matchmaking Gateway
          </span>
        </div>
        <EncartoArenaOnline onBackToHub={onBackToHub} playerName={playerName} />
      </div>
    );
  }

  const primaryOpponent = hud.opponents.length > 0 ? hud.opponents[0] : null;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto px-2 sm:px-6 py-3 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel px-6 py-3.5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/10 hover:border-primary/50 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Hub
          </button>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="p-2 bg-primary/20 rounded-xl text-primary border border-primary/30">
              <Swords size={20} />
            </div>
            <div>
              <h2 className="anime-title text-xl text-white tracking-wider uppercase leading-none">
                Encarto Arena
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  {selectedMode === 'PRACTICE_DUMMY' ? 'Target Practice' : selectedMode === 'BOT_DUEL' ? '1v1 AI Duel' : `${selectedBotCount}v1 AI Skirmish`}
                </span>
                <span className="text-gray-600 text-[10px]">•</span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                  selectedDifficulty === 'HARD' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                  selectedDifficulty === 'NORMAL' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                  'bg-green-500/20 text-green-400 border-green-500/40'
                }`}>
                  {selectedDifficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Timer & Score Display */}
        <div className="flex items-center gap-4 sm:gap-6 bg-black/40 px-5 py-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-yellow-400">
            <Timer size={16} />
            <span className="font-mono text-base font-black tracking-wider">
              {formatTime(hud.matchTimeRemaining)}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-cyan-400">
            <Trophy size={16} />
            <span className="font-mono text-base font-black">
              {hud.stats.score.toLocaleString()} <span className="text-[9px] text-gray-500 font-bold uppercase">PTS</span>
            </span>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnlinePvP(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider border border-cyan-400/40 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Radio size={14} className="animate-pulse text-yellow-300" />
            <span className="hidden sm:inline">Online PvP</span>
          </button>
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
              showConfigDrawer
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
            }`}
          >
            <Bot size={15} />
            <span className="hidden sm:inline">Bot Setup</span>
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-colors"
            title="Controls & Instructions"
          >
            <Info size={18} />
          </button>
          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={() => handleRestart()}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl border border-primary/40 text-xs font-black uppercase tracking-wider transition-all"
          >
            <RotateCcw size={15} />
            Rematch
          </button>
        </div>
      </div>

      {/* Bot Setup / Difficulty Drawer */}
      {showConfigDrawer && (
        <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-black/90 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Mode selection */}
            <div className="w-full md:w-auto">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                Combat Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyConfig('BOT_DUEL', selectedDifficulty, 1)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                    selectedMode === 'BOT_DUEL'
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  <Bot size={15} /> 1v1 Bot Duel
                </button>
                <button
                  onClick={() => handleApplyConfig('BOT_SKIRMISH', selectedDifficulty, 2)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                    selectedMode === 'BOT_SKIRMISH'
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  <Users size={15} /> AI Skirmish
                </button>
                <button
                  onClick={() => handleApplyConfig('PRACTICE_DUMMY', selectedDifficulty, 1)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                    selectedMode === 'PRACTICE_DUMMY'
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  <Target size={15} /> Training Dummy
                </button>
              </div>
            </div>

            {/* Difficulty selection (Only if in Bot modes) */}
            {selectedMode !== 'PRACTICE_DUMMY' && (
              <div className="w-full md:w-auto">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                  Bot Difficulty (Intelligence & Tactics)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyConfig(selectedMode, 'EASY', selectedBotCount)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      selectedDifficulty === 'EASY'
                        ? 'bg-green-500/20 text-green-400 border-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                    }`}
                  >
                    Easy (Recruit)
                  </button>
                  <button
                    onClick={() => handleApplyConfig(selectedMode, 'NORMAL', selectedBotCount)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      selectedDifficulty === 'NORMAL'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                    }`}
                  >
                    Normal (Veteran)
                  </button>
                  <button
                    onClick={() => handleApplyConfig(selectedMode, 'HARD', selectedBotCount)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      selectedDifficulty === 'HARD'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                    }`}
                  >
                    Hard (Apex AI)
                  </button>
                </div>
              </div>
            )}

            {/* Bot Count (If Skirmish) */}
            {selectedMode === 'BOT_SKIRMISH' && (
              <div className="w-full md:w-auto">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                  Bot Count
                </label>
                <div className="flex gap-2">
                  {[2, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleApplyConfig('BOT_SKIRMISH', selectedDifficulty, count)}
                      className={`w-10 h-10 rounded-xl text-xs font-black uppercase border transition-all ${
                        selectedBotCount === count
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions Dropdown Drawer */}
      {showHelp && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-black/80 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-black uppercase text-cyan-400 tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={14} /> Combat Manual & Input Bindings
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Movement</span>
              <span className="font-black text-white">W, A, S, D / Arrow Keys</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Aim & Direction</span>
              <span className="font-black text-white">Mouse Cursor / Point</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Light Bolt Attack</span>
              <span className="font-black text-white">Left Click / Q Key</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Heavy Blast / Dash</span>
              <span className="font-black text-white">Right Click (E) / Spacebar</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport Container */}
      <div className="relative flex-grow flex items-center justify-center bg-[#05070e] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl min-h-[460px]">
        {/* Phaser Canvas Root */}
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />

        {/* In-Game Heads-Up Display (HUD) Overlay */}
        <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
          {/* Top Bars: Player Health & Opponent Health */}
          <div className="flex justify-between items-start gap-4">
            {/* Player Health Bar */}
            <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 bg-black/70 w-64 shadow-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Shield size={14} /> {playerName}
                </span>
                <span className="font-mono font-bold text-white">
                  {hud.health} / {hud.maxHealth}
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(0, (hud.health / hud.maxHealth) * 100)}%` }}
                />
              </div>
            </div>

            {/* Opponent Health Bar: Training Dummy or AI Bot */}
            {hud.mode === 'PRACTICE_DUMMY' ? (
              <div className="glass-panel p-3.5 rounded-2xl border border-red-500/30 bg-black/70 w-64 shadow-xl text-right">
                <div className="flex justify-between items-center text-xs mb-1.5 flex-row-reverse">
                  <span className="font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Target size={14} /> Training Dummy
                  </span>
                  <span className="font-mono font-bold text-white">
                    {hud.dummyHealth} / {hud.dummyMaxHealth}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-l from-red-500 to-orange-500 rounded-full transition-all duration-200 ml-auto"
                    style={{ width: `${Math.max(0, (hud.dummyHealth / hud.dummyMaxHealth) * 100)}%` }}
                  />
                </div>
              </div>
            ) : primaryOpponent ? (
              <div className="glass-panel p-3.5 rounded-2xl border border-red-500/30 bg-black/70 w-72 shadow-xl text-right">
                <div className="flex justify-between items-center text-xs mb-1.5 flex-row-reverse">
                  <span className="font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Bot size={14} /> {primaryOpponent.name}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {primaryOpponent.health} / {primaryOpponent.maxHealth}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 mb-1">
                  <div
                    className="h-full bg-gradient-to-l from-red-500 to-orange-500 rounded-full transition-all duration-200 ml-auto"
                    style={{ width: `${Math.max(0, (primaryOpponent.health / primaryOpponent.maxHealth) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                  <span className="uppercase text-yellow-400 font-bold">STATE: {primaryOpponent.state}</span>
                  <span className={`px-1.5 py-0.2 rounded font-black uppercase ${
                    primaryOpponent.difficulty === 'HARD' ? 'text-purple-400' :
                    primaryOpponent.difficulty === 'NORMAL' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    DIFF: {primaryOpponent.difficulty}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Secondary Opponents Bar (in Skirmish mode) */}
          {hud.opponents.length > 1 && (
            <div className="self-end flex gap-2 -mt-4">
              {hud.opponents.slice(1).map((bot) => (
                <div key={bot.id} className="glass-panel px-3 py-1.5 rounded-xl border border-red-500/20 bg-black/70 text-right w-44">
                  <div className="flex justify-between text-[9px] font-bold text-gray-300 mb-1">
                    <span>{bot.name}</span>
                    <span>{bot.health}/{bot.maxHealth}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.max(0, (bot.health / bot.maxHealth) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Combo counter in center-right */}
          {hud.stats.currentCombo > 1 && (
            <div className="self-end my-auto glass-panel px-4 py-2 rounded-2xl border border-yellow-500/40 bg-black/80 animate-bounce">
              <div className="flex items-center gap-2 text-yellow-400">
                <Flame size={20} />
                <span className="anime-title text-2xl tracking-wider">
                  {hud.stats.currentCombo}x COMBO!
                </span>
              </div>
            </div>
          )}

          {/* Bottom Cooldown & Ability Tray */}
          <div className="flex justify-center items-center gap-3">
            {/* Primary Attack */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 bg-black/70 flex items-center gap-3 shadow-xl">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm transition-all ${
                  hud.attackReady
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                <MousePointer size={18} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Light Bolt</div>
                <div className="text-[9px] font-bold text-cyan-400 uppercase">L-Click / Q</div>
              </div>
            </div>

            {/* Special Attack */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 bg-black/70 flex items-center gap-3 shadow-xl">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm relative overflow-hidden transition-all ${
                  hud.specialAttackReady
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.4)]'
                    : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                {!hud.specialAttackReady && (
                  <div
                    className="absolute inset-0 bg-purple-600/30"
                    style={{ transform: `scaleY(${1 - hud.specialCooldownProgress})`, transformOrigin: 'top' }}
                  />
                )}
                <Zap size={18} className="relative z-10" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Heavy Blast</div>
                <div className="text-[9px] font-bold text-purple-400 uppercase">R-Click / E</div>
              </div>
            </div>

            {/* Dash Ability */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 bg-black/70 flex items-center gap-3 shadow-xl">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm relative overflow-hidden transition-all ${
                  hud.dashReady
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                    : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                {!hud.dashReady && (
                  <div
                    className="absolute inset-0 bg-yellow-600/30"
                    style={{ transform: `scaleY(${1 - hud.dashCooldownProgress})`, transformOrigin: 'top' }}
                  />
                )}
                <Flame size={18} className="relative z-10" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tactical Dash</div>
                <div className="text-[9px] font-bold text-yellow-400 uppercase">SPACEBAR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Completed Modal (Victory / Defeat / Draw) */}
        {hud.status !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-20 animate-in fade-in">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-primary/40 text-center space-y-6 shadow-2xl">
              <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-2 shadow-2xl ${
                hud.status === 'VICTORY'
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-yellow-500/30'
                  : hud.status === 'DEFEAT'
                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-red-500/30'
                  : 'bg-primary/20 border-primary text-primary shadow-primary/30'
              }`}>
                {hud.status === 'VICTORY' ? <Trophy size={40} /> : hud.status === 'DEFEAT' ? <Skull size={40} /> : <Award size={40} />}
              </div>

              <div>
                <h3 className={`anime-title text-4xl uppercase tracking-wider ${
                  hud.status === 'VICTORY' ? 'text-yellow-400' : hud.status === 'DEFEAT' ? 'text-red-400' : 'text-white'
                }`}>
                  {hud.status === 'VICTORY' ? 'Victory Achieved' : hud.status === 'DEFEAT' ? 'Defeat' : 'Draw'}
                </h3>
                <p className="text-xs font-black uppercase text-primary tracking-widest mt-1">
                  {selectedMode === 'PRACTICE_DUMMY' ? 'Target Session Concluded' : `${selectedDifficulty} AI Battle Evaluation`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Score</span>
                  <span className="text-lg font-black text-white font-mono">{hud.stats.score}</span>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Damage Dealt</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">{hud.stats.damageDealt}</span>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Damage Taken</span>
                  <span className="text-lg font-black text-red-400 font-mono">{hud.stats.damageTaken}</span>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Bots Neutralized</span>
                  <span className="text-lg font-black text-yellow-400 font-mono">{hud.stats.botsDefeated}</span>
                </div>
              </div>

              {/* Difficulty Quick Select for Rematch */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {(['EASY', 'NORMAL', 'HARD'] as BotDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => handleApplyConfig(selectedMode, d, selectedBotCount)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                      selectedDifficulty === d
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleRestart()}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Instant Rematch
                </button>
                <button
                  onClick={onBackToHub}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all"
                >
                  Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Status Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-bold px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Arcade Physics Active
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-cyan-400">
            Opponent Model: {selectedMode === 'PRACTICE_DUMMY' ? 'Passive Target' : `Autonomous AI FSM [${selectedDifficulty}]`}
          </span>
        </div>
        <div className="hidden sm:block">
          <span>Engine: Phaser 3.90 • Physics: Arcade • Precision: 60 FPS • Offline AI</span>
        </div>
      </div>
    </div>
  );
};
