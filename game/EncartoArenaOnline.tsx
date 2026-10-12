import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Wifi,
  WifiOff,
  Skull,
  Award,
  Loader2,
  XCircle,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { getSocket, MatchFoundPayload, BotOfferPayload, MatchSnapshotPayload, MatchConcludedPayload, OnlinePlayerState } from '../socketClient.ts';
import { AudioManager } from './audio/audioManager.ts';

interface EncartoArenaOnlineProps {
  onBackToHub: () => void;
  playerName?: string;
  userId?: string;
}

type OnlineState =
  | 'IDLE'
  | 'QUEUED'
  | 'BOT_OFFERED'
  | 'MATCH_FOUND'
  | 'PLAYING'
  | 'CONCLUDED';

export const EncartoArenaOnline: React.FC<EncartoArenaOnlineProps> = ({
  onBackToHub,
  playerName = 'Pilot',
  userId = 'player-1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioManager = useRef(new AudioManager());

  // Matchmaking State
  const [onlineState, setOnlineState] = useState<OnlineState>('IDLE');
  const [queueTime, setQueueTime] = useState(0);
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null);
  const [botOffer, setBotOffer] = useState<BotOfferPayload | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [concludedData, setConcludedData] = useState<MatchConcludedPayload | null>(null);
  const [disconnectWarning, setDisconnectWarning] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(32);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Authoritative State from Server
  const latestSnapshot = useRef<MatchSnapshotPayload | null>(null);
  const [hudState, setHudState] = useState({
    myHealth: 100,
    myMaxHealth: 100,
    opponentHealth: 100,
    opponentMaxHealth: 100,
    opponentName: 'Searching...',
    opponentIsBot: false,
    timeRemaining: 120,
    myScore: 0,
    myCombo: 0,
  });

  // Input Tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cooldown local UI progress
  const [attackCooldownProgress, setAttackCooldownProgress] = useState(1);
  const [specialCooldownProgress, setSpecialCooldownProgress] = useState(1);
  const [dashCooldownProgress, setDashCooldownProgress] = useState(1);
  const lastAttackTime = useRef(0);
  const lastSpecialTime = useRef(0);
  const lastDashTime = useRef(0);

  // 1. Socket Setup & Listeners
  useEffect(() => {
    const socket = getSocket();

    // Measure latency
    const pingInterval = setInterval(() => {
      const start = Date.now();
      socket.volatile.emit('ping', () => {
        setLatencyMs(Date.now() - start);
      });
    }, 4000);

    socket.on('matchmaking:queued', () => {
      setOnlineState('QUEUED');
      setQueueTime(0);
    });

    socket.on('matchmaking:left', () => {
      setOnlineState('IDLE');
    });

    socket.on('matchmaking:bot_offer', (offer: BotOfferPayload) => {
      setBotOffer(offer);
      setOnlineState('BOT_OFFERED');
    });

    socket.on('matchmaking:match_found', (data: MatchFoundPayload) => {
      setMatchData(data);
      setOnlineState('MATCH_FOUND');
      setIsReady(false);
      audioManager.current.playHit();
    });

    socket.on('match:start', (data: any) => {
      setOnlineState('PLAYING');
      setDisconnectWarning(null);
    });

    socket.on('match:snapshot', (snapshot: MatchSnapshotPayload) => {
      latestSnapshot.current = snapshot;

      // Extract local player and opponent
      const myPlayer = snapshot.players.find((p) => p.name === playerName || p.id === userId);
      const opponent = snapshot.players.find((p) => (p.name !== playerName && p.id !== userId));

      if (myPlayer) {
        setHudState((prev) => ({
          ...prev,
          myHealth: myPlayer.health,
          myMaxHealth: myPlayer.maxHealth,
          myScore: myPlayer.score,
          myCombo: myPlayer.currentCombo,
          timeRemaining: snapshot.timeRemaining,
          opponentHealth: opponent ? opponent.health : prev.opponentHealth,
          opponentMaxHealth: opponent ? opponent.maxHealth : prev.opponentMaxHealth,
          opponentName: opponent ? opponent.name : prev.opponentName,
          opponentIsBot: opponent ? opponent.isBot : prev.opponentIsBot,
        }));
      }
    });

    socket.on('match:hit', (hit: any) => {
      if (hit.attackerId === userId) {
        audioManager.current.playHit();
      } else {
        audioManager.current.playPlayerHurt();
      }
    });

    socket.on('match:player_disconnected', (data: { userId: string; timeoutSeconds: number }) => {
      setDisconnectWarning(`Adversary disconnected! Awaiting reconnection (${data.timeoutSeconds}s)...`);
    });

    socket.on('match:player_reconnected', () => {
      setDisconnectWarning(null);
    });

    socket.on('match:concluded', (res: MatchConcludedPayload) => {
      setConcludedData(res);
      setOnlineState('CONCLUDED');
      if (res.winnerId === userId) {
        audioManager.current.playVictory();
      } else {
        audioManager.current.playDefeat();
      }
    });

    return () => {
      clearInterval(pingInterval);
      socket.off('matchmaking:queued');
      socket.off('matchmaking:left');
      socket.off('matchmaking:bot_offer');
      socket.off('matchmaking:match_found');
      socket.off('match:start');
      socket.off('match:snapshot');
      socket.off('match:hit');
      socket.off('match:player_disconnected');
      socket.off('match:player_reconnected');
      socket.off('match:concluded');
    };
  }, [playerName, userId]);

  // 2. Queue Timer Increment
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (onlineState === 'QUEUED') {
      timer = setInterval(() => {
        setQueueTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [onlineState]);

  // 3. User Actions
  const handleJoinQueue = () => {
    const socket = getSocket();
    socket.emit('matchmaking:join', { gameType: 'arena', wager: 0 });
    setOnlineState('QUEUED');
  };

  const handleLeaveQueue = () => {
    const socket = getSocket();
    socket.emit('matchmaking:leave');
    setOnlineState('IDLE');
  };

  const handleAcceptBot = () => {
    const socket = getSocket();
    socket.emit('matchmaking:accept_bot');
  };

  const handleSendReady = () => {
    if (!matchData) return;
    const socket = getSocket();
    socket.emit('match:ready', { matchId: matchData.matchId });
    setIsReady(true);
  };

  // 4. Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Spacebar for Dash
      if (e.code === 'Space' && onlineState === 'PLAYING' && matchData) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastDashTime.current >= 2000) {
          lastDashTime.current = now;
          audioManager.current.playDash();
          getSocket().emit('match:dash', { matchId: matchData.matchId });
        }
      }

      // Q for Light Bolt
      if (e.key.toLowerCase() === 'q' && onlineState === 'PLAYING' && matchData) {
        handleTriggerAttack();
      }

      // E for Heavy Special
      if (e.key.toLowerCase() === 'e' && onlineState === 'PLAYING' && matchData) {
        handleTriggerSpecial();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePos.current = {
        x: (e.clientX - rect.left) * (1200 / rect.width),
        y: (e.clientY - rect.top) * (800 / rect.height),
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onlineState, matchData]);

  // 5. Trigger Attacks
  const handleTriggerAttack = () => {
    if (!matchData || onlineState !== 'PLAYING') return;
    const now = Date.now();
    if (now - lastAttackTime.current < 250) return;
    lastAttackTime.current = now;

    const myPlayer = latestSnapshot.current?.players.find((p) => p.name === playerName || p.id === userId);
    const px = myPlayer ? myPlayer.x : 240;
    const py = myPlayer ? myPlayer.y : 400;
    const angle = Math.atan2(mousePos.current.y - py, mousePos.current.x - px);

    audioManager.current.playAttack();
    getSocket().emit('match:attack', { matchId: matchData.matchId, aimAngle: angle });
  };

  const handleTriggerSpecial = () => {
    if (!matchData || onlineState !== 'PLAYING') return;
    const now = Date.now();
    if (now - lastSpecialTime.current < 2500) return;
    lastSpecialTime.current = now;

    const myPlayer = latestSnapshot.current?.players.find((p) => p.name === playerName || p.id === userId);
    const px = myPlayer ? myPlayer.x : 240;
    const py = myPlayer ? myPlayer.y : 400;
    const angle = Math.atan2(mousePos.current.y - py, mousePos.current.x - px);

    audioManager.current.playSpecialAttack();
    getSocket().emit('match:special', { matchId: matchData.matchId, aimAngle: angle });
  };

  // 6. Network Input Sender (30Hz)
  useEffect(() => {
    if (onlineState !== 'PLAYING' || !matchData) return;

    const inputTimer = setInterval(() => {
      let vx = 0;
      let vy = 0;
      const k = keysPressed.current;

      if (k['w'] || k['arrowup']) vy -= 1;
      if (k['s'] || k['arrowdown']) vy += 1;
      if (k['a'] || k['arrowleft']) vx -= 1;
      if (k['d'] || k['arrowright']) vx += 1;

      const myPlayer = latestSnapshot.current?.players.find((p) => p.name === playerName || p.id === userId);
      const px = myPlayer ? myPlayer.x : 240;
      const py = myPlayer ? myPlayer.y : 400;
      const aimAngle = Math.atan2(mousePos.current.y - py, mousePos.current.x - px);

      getSocket().emit('match:input', {
        matchId: matchData.matchId,
        vx,
        vy,
        aimAngle,
      });

      // Update cooldown bars
      const now = Date.now();
      setAttackCooldownProgress(Math.min(1, (now - lastAttackTime.current) / 250));
      setSpecialCooldownProgress(Math.min(1, (now - lastSpecialTime.current) / 2500));
      setDashCooldownProgress(Math.min(1, (now - lastDashTime.current) / 2000));
    }, 33);

    return () => clearInterval(inputTimer);
  }, [onlineState, matchData, playerName, userId]);

  // 7. Canvas Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, 1200, 800);

      // Arena Background Grid
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, 1200, 800);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 800);
        ctx.stroke();
      }
      for (let y = 0; y < 800; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Center ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(600, 400, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Outer walls
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 1160, 760);

      const snapshot = latestSnapshot.current;
      if (snapshot) {
        // Draw Projectiles
        for (const proj of snapshot.projectiles) {
          const isMyProj = proj.ownerId === userId;
          ctx.save();
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.isSpecial ? 12 : 7, 0, Math.PI * 2);
          ctx.fillStyle = isMyProj ? (proj.isSpecial ? '#d946ef' : '#38bdf8') : (proj.isSpecial ? '#dc2626' : '#f97316');
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        }

        // Draw Players
        for (const p of snapshot.players) {
          const isMe = p.name === playerName || p.id === userId;
          ctx.save();
          ctx.translate(p.x, p.y);

          // Shadow / glow
          ctx.shadowColor = isMe ? '#06b6d4' : p.isBot ? '#ef4444' : '#a855f7';
          ctx.shadowBlur = p.isDashing ? 24 : 14;

          // Disc body
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fillStyle = isMe ? '#0e7490' : p.isBot ? '#7f1d1d' : '#581c87';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = isMe ? '#22d3ee' : p.isBot ? '#f87171' : '#c084fc';
          ctx.stroke();

          // Heading notch
          ctx.rotate(p.aimAngle);
          ctx.beginPath();
          ctx.moveTo(22, 0);
          ctx.lineTo(12, -8);
          ctx.lineTo(12, 8);
          ctx.closePath();
          ctx.fillStyle = isMe ? '#22d3ee' : p.isBot ? '#f97316' : '#e879f9';
          ctx.fill();
          ctx.restore();

          // Overhead Name & HP bar
          ctx.save();
          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(p.isBot ? `[AI BOT] ${p.name}` : p.name, p.x, p.y - 32);

          // HP bar
          ctx.fillStyle = '#111827';
          ctx.fillRect(p.x - 24, p.y - 24, 48, 5);
          ctx.fillStyle = isMe ? '#06b6d4' : '#ef4444';
          const hpW = Math.max(0, (p.health / p.maxHealth) * 48);
          ctx.fillRect(p.x - 24, p.y - 24, hpW, 5);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [playerName, userId]);

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto px-2 sm:px-6 py-3 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel px-6 py-3.5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (onlineState === 'QUEUED') handleLeaveQueue();
              onBackToHub();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/10 hover:border-primary/50 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Hub
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/20 rounded-xl text-primary border border-primary/30">
              <Radio size={20} className={onlineState === 'PLAYING' ? 'animate-pulse text-green-400' : ''} />
            </div>
            <div>
              <h2 className="anime-title text-xl text-white tracking-wider uppercase leading-none">
                Real-Time Online Arena
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  {onlineState === 'PLAYING' ? 'Live Synchronized PvP' : 'Matchmaking Lobby'}
                </span>
                <span className="text-gray-600 text-[10px]">•</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-green-400">
                  <Wifi size={11} /> {latencyMs}ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timer & Score Display */}
        <div className="flex items-center gap-4 sm:gap-6 bg-black/40 px-5 py-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-yellow-400">
            <Timer size={16} />
            <span className="font-mono text-base font-black tracking-wider">
              {formatSecs(hudState.timeRemaining)}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-cyan-400">
            <Trophy size={16} />
            <span className="font-mono text-base font-black">
              {hudState.myScore.toLocaleString()} <span className="text-[9px] text-gray-500 font-bold uppercase">PTS</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-colors"
            title="Controls & Instructions"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => {
              const muted = audioManager.current.toggleMute();
              setIsMuted(muted);
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Disconnect Alert Banner */}
      {disconnectWarning && (
        <div className="bg-yellow-500/20 border-2 border-yellow-500/50 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <WifiOff className="text-yellow-400" size={20} />
          <span className="text-xs font-black uppercase text-yellow-300 tracking-wider">
            {disconnectWarning}
          </span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative flex-grow flex items-center justify-center bg-[#05070e] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl min-h-[500px]">
        {/* Canvas for Live Render */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full h-full object-contain cursor-crosshair"
          onClick={handleTriggerAttack}
          onContextMenu={(e) => {
            e.preventDefault();
            handleTriggerSpecial();
          }}
        />

        {/* IDLE / QUEUED / MATCHMAKING MODAL OVERLAY */}
        {onlineState === 'IDLE' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-20">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-primary/40 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-3xl mx-auto flex items-center justify-center text-primary shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <Swords size={40} />
              </div>

              <div>
                <h3 className="anime-title text-3xl text-white uppercase tracking-wider">
                  Online Matchmaking
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1">
                  Queue for an authoritative real-time 1v1 PvP match on Encarto Arena.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold uppercase">Player Pilot</span>
                  <span className="text-white font-black">{playerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold uppercase">Server Authority</span>
                  <span className="text-green-400 font-black">30 Hz Real-Time Tick</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold uppercase">Queue Policy</span>
                  <span className="text-cyan-400 font-black">Bot Fallback after 10s</span>
                </div>
              </div>

              <button
                onClick={handleJoinQueue}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
              >
                <Users size={16} /> Enter Matchmaking Queue
              </button>
            </div>
          </div>
        )}

        {onlineState === 'QUEUED' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-20">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-cyan-500/40 text-center space-y-6 shadow-2xl">
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 mx-auto flex items-center justify-center animate-spin">
                <Radio className="text-cyan-400 animate-pulse" size={36} />
              </div>

              <div>
                <h3 className="anime-title text-3xl text-white uppercase tracking-wider">
                  Searching for Opponent
                </h3>
                <p className="text-xs font-mono font-bold text-cyan-400 mt-2">
                  Queue Time: {formatSecs(queueTime)}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Scanning active contenders on the platform...
                </p>
              </div>

              <button
                onClick={handleLeaveQueue}
                className="w-full py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Cancel Queue
              </button>
            </div>
          </div>
        )}

        {/* BOT OFFER FALLBACK MODAL */}
        {onlineState === 'BOT_OFFERED' && botOffer && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20 animate-in fade-in">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-yellow-500/40 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500 rounded-3xl mx-auto flex items-center justify-center text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <Bot size={40} />
              </div>

              <div>
                <h3 className="anime-title text-2xl text-white uppercase tracking-wider">
                  No Players Found Yet
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {botOffer.message}
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/40 text-[10px] font-black uppercase text-yellow-400">
                  Clearly Labeled: {botOffer.botName}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAcceptBot}
                  className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2"
                >
                  <Bot size={16} /> Battle AI Opponent ({botOffer.botName})
                </button>
                <button
                  onClick={() => setOnlineState('QUEUED')}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all"
                >
                  Keep Waiting in Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATCH FOUND & READY HANDSHAKE */}
        {onlineState === 'MATCH_FOUND' && matchData && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20 animate-in zoom-in-95 duration-200">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-primary/50 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-3xl mx-auto flex items-center justify-center text-primary shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <Swords size={40} />
              </div>

              <div>
                <h3 className="anime-title text-3xl text-white uppercase tracking-wider">
                  Match Formed!
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-1">
                  Session ID: {matchData.matchId.slice(0, 16)}...
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-left">
                {matchData.participants.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between text-xs">
                    <span className="font-black text-white flex items-center gap-2">
                      {p.isBot ? <Bot size={14} className="text-yellow-400" /> : <Shield size={14} className="text-cyan-400" />}
                      {p.username}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      p.isBot ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {p.isBot ? 'AI BOT' : `Rank ${p.rank}`}
                    </span>
                  </div>
                ))}
              </div>

              {!isReady ? (
                <button
                  onClick={handleSendReady}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Ready for Combat Handshake
                </button>
              ) : (
                <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-2xl text-green-300 text-xs font-black uppercase flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Awaiting All Players Ready...
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD OVERLAY DURING PLAY */}
        {onlineState === 'PLAYING' && (
          <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
            {/* Top Health Bars */}
            <div className="flex justify-between items-start gap-4">
              {/* My Health Bar */}
              <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 bg-black/70 w-64 shadow-xl">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Shield size={14} /> {playerName} (You)
                  </span>
                  <span className="font-mono font-bold text-white">
                    {hudState.myHealth} / {hudState.myMaxHealth}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${Math.max(0, (hudState.myHealth / hudState.myMaxHealth) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Opponent Health Bar */}
              <div className="glass-panel p-3.5 rounded-2xl border border-red-500/30 bg-black/70 w-72 shadow-xl text-right">
                <div className="flex justify-between items-center text-xs mb-1.5 flex-row-reverse">
                  <span className="font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    {hudState.opponentIsBot ? <Bot size={14} /> : <Target size={14} />}
                    {hudState.opponentName}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {hudState.opponentHealth} / {hudState.opponentMaxHealth}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 mb-1">
                  <div
                    className="h-full bg-gradient-to-l from-red-500 to-orange-500 rounded-full transition-all duration-200 ml-auto"
                    style={{ width: `${Math.max(0, (hudState.opponentHealth / hudState.opponentMaxHealth) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                  <span className="text-yellow-400 uppercase font-bold">
                    {hudState.opponentIsBot ? 'LABEL: AUTHORITATIVE BOT' : 'LABEL: HUMAN PVP'}
                  </span>
                  <span className="text-gray-400">SERVER SYNCED</span>
                </div>
              </div>
            </div>

            {/* Combo indicator */}
            {hudState.myCombo > 1 && (
              <div className="self-end my-auto glass-panel px-4 py-2 rounded-2xl border border-yellow-500/40 bg-black/80 animate-bounce">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Flame size={20} />
                  <span className="anime-title text-2xl tracking-wider">
                    {hudState.myCombo}x COMBO!
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Cooldown Tray */}
            <div className="flex justify-center items-center gap-3">
              {/* Primary Attack */}
              <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 bg-black/70 flex items-center gap-3 shadow-xl">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm ${
                    attackCooldownProgress >= 1
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
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm relative overflow-hidden ${
                    specialCooldownProgress >= 1
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.4)]'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  <Zap size={18} className="relative z-10" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Heavy Blast</div>
                  <div className="text-[9px] font-bold text-purple-400 uppercase">R-Click / E</div>
                </div>
              </div>

              {/* Dash */}
              <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 bg-black/70 flex items-center gap-3 shadow-xl">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-sm ${
                    dashCooldownProgress >= 1
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  <Flame size={18} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tactical Dash</div>
                  <div className="text-[9px] font-bold text-yellow-400 uppercase">SPACEBAR</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATCH CONCLUDED MODAL */}
        {onlineState === 'CONCLUDED' && concludedData && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20 animate-in fade-in">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-primary/40 text-center space-y-6 shadow-2xl">
              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-2 shadow-2xl ${
                  concludedData.winnerId === userId
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-yellow-500/30'
                    : 'bg-red-500/20 border-red-500 text-red-400 shadow-red-500/30'
                }`}
              >
                {concludedData.winnerId === userId ? <Trophy size={40} /> : <Skull size={40} />}
              </div>

              <div>
                <h3
                  className={`anime-title text-4xl uppercase tracking-wider ${
                    concludedData.winnerId === userId ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {concludedData.winnerId === userId ? 'Victory Achieved' : 'Defeat'}
                </h3>
                <p className="text-xs font-black uppercase text-primary tracking-widest mt-1">
                  Reason: {concludedData.reason}
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Experience Reward</span>
                  <span className="text-green-400 font-black">
                    {concludedData.winnerId === userId ? '+150 EXP' : '+50 EXP'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Final Match Score</span>
                  <span className="text-white font-mono font-black">{hudState.myScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Session ID</span>
                  <span className="text-gray-500 font-mono text-[10px]">{concludedData.matchId.slice(0, 18)}...</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleJoinQueue}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Queue Next Match
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

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-bold px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Server Authoritative Gateway Active
          </span>
          <span className="text-gray-600">•</span>
          <span>Latency: {latencyMs}ms</span>
        </div>
        <div className="hidden sm:block">
          <span>Simulation: 30 Hz Server Tick • State: WebSockets (Socket.IO) • Zero Client Trust</span>
        </div>
      </div>
    </div>
  );
};
