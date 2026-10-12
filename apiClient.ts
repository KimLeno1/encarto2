export const API_BASE_URL = '/api';

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: any;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export const api = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    birthday?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(credentials: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  async logout(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  async getMe(): Promise<{ user?: any; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) {
      return { error: 'Not authenticated' };
    }
    return res.json();
  },

  async updateProfile(userId: string, data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMyProgression(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  async getUserProgression(userId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/profile/${userId}`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  async getMatchHistory(userId: string, filter?: { mode?: string; gameType?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filter?.mode) params.set('mode', filter.mode);
    if (filter?.gameType) params.set('gameType', filter.gameType);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/progression/history/${userId}${query}`, {
      credentials: 'include',
    });
    if (!res.ok) return { history: [] };
    return res.json();
  },

  async getLeaderboard(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/leaderboard`, {
      credentials: 'include',
    });
    if (!res.ok) return { leaderboard: [] };
    return res.json();
  },

  async completeBotMatch(payload: {
    matchId: string;
    gameType?: string;
    botDifficulty?: string;
    botName?: string;
    outcome: 'VICTORY' | 'DEFEAT' | 'DRAW';
    score: number;
    damageDealt: number;
    botsDefeated: number;
    durationSeconds: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/complete-bot-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Admin Operations
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch admin stats');
    return res.json();
  },

  async getAdminUsers(search?: string): Promise<any> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/users${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async updateAdminUserRole(userId: string, role: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async updateAdminUserStatus(userId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminMatches(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/matches`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async getAdminAuditLogs(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async configureGame(game: string, enabled: boolean): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/config/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ game, enabled }),
    });
    return res.json();
  },

  async configureBots(difficulty: string, params: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/config/bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ difficulty, ...params }),
    });
    return res.json();
  },
};
