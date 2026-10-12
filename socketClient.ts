import { io, Socket } from 'socket.io-client';

export interface OnlinePlayerState {
  id: string;
  name: string;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  maxHealth: number;
  score: number;
  damageDealt: number;
  damageTaken: number;
  currentCombo: number;
  isDashing: boolean;
  isInvulnerable: boolean;
}

export interface OnlineProjectile {
  id: string;
  x: number;
  y: number;
  isSpecial: boolean;
  ownerId: string;
}

export interface MatchSnapshotPayload {
  timeRemaining: number;
  players: OnlinePlayerState[];
  projectiles: OnlineProjectile[];
}

export interface MatchFoundPayload {
  matchId: string;
  gameType: string;
  wager: number;
  isBotMatch: boolean;
  botName?: string;
  participants: Array<{
    userId: string;
    username: string;
    rank: number;
    isBot: boolean;
  }>;
  handshakeTimeoutSeconds: number;
}

export interface BotOfferPayload {
  userId: string;
  message: string;
  botName: string;
  timeoutSeconds: number;
}

export interface MatchConcludedPayload {
  matchId: string;
  winnerId: string | null;
  loserId: string | null;
  winnerName: string | null;
  reason: 'ELIMINATION' | 'TIMEOUT' | 'FORFEIT' | 'DRAW';
  stats: {
    winnerScore: number;
    loserScore: number;
    players: OnlinePlayerState[];
  };
}

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const token = localStorage.getItem('encarto_token') || undefined;
    socketInstance = io(window.location.origin, {
      withCredentials: true,
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
