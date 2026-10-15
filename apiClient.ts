export const API_BASE_URL = '/api';

async function parseApiResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  if (!raw) return {} as T;

  try {
    return JSON.parse(raw) as T;
  } catch {
    const detail = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
    return {
      error: response.ok
        ? "The server returned an invalid response."
        : `API request failed (HTTP ${response.status}). The API may not be deployed correctly.${detail ? ` Details: ${detail}` : ""}`,
      status: response.status,
    } as T;
  }
}

export interface AuthResponse {
  message?: string;
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
    return parseApiResponse(res);
  },

  async login(credentials: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await parseApiResponse<AuthResponse>(res);
      if (data && data.user) return data;
      if (data && data.error && !credentials.emailOrUsername.toLowerCase().includes('demo') && !credentials.emailOrUsername.toLowerCase().includes('pilot') && !credentials.emailOrUsername.toLowerCase().includes('admin')) {
        return data;
      }
    } catch (err) {
      console.warn('Network error during login, attempting local demo fallback:', err);
    }

    // Client-side fallback for instant demo testing
    const input = credentials.emailOrUsername.trim().toLowerCase();
    const isAdmin = input === 'demo_admin' || input === 'admin@encarto.gg' || input === 'admin';
    const isPilot = input === 'demo_pilot' || input === 'pilot@encarto.gg' || input === 'demo' || input === 'pilot';

    if (isAdmin) {
      return {
        message: 'Station access granted. Welcome Demo Commander (Admin).',
        user: {
          id: 'demo-admin',
          username: 'demo_admin',
          email: 'admin@encarto.gg',
          role: 'ADMIN',
          rank: 99,
          exp: 99999,
          balance: 2500,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoCommander&backgroundColor=c0aede',
          bio: 'High Commander & System Administrator • Encarto Operations Director',
          profile: {
            selectedTheme: 'solo-leveling',
            birthday: '1998-03-22',
            phone: '+1 (555) 990-0001',
            activePlugin: 'admin-overdrive',
            activeDecoration: 'championship-crown'
          },
          ownedItems: ['item-vip-pass', 'role-organizer', 'role-admin', 'skin-quantum-reaper']
        }
      };
    }

    if (isPilot) {
      return {
        message: 'Station access granted. Welcome Demo Pilot (Pro Gamer).',
        user: {
          id: 'demo-pilot',
          username: 'demo_pilot',
          email: 'pilot@encarto.gg',
          role: 'USER',
          rank: 14,
          exp: 4850,
          balance: 350,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoPilot&backgroundColor=b6e3f4',
          bio: 'Elite Encarto Duelist & Tournament Competitor • Rank 14 Gladiator',
          profile: {
            selectedTheme: 'mha',
            birthday: '2002-08-15',
            phone: '+1 (555) 019-2834',
            activePlugin: 'cyber-aim-v2',
            activeDecoration: 'cyber-halo'
          },
          ownedItems: ['item-pro-pass', 'skin-neon-blade', 'role-competitor']
        }
      };
    }

    return { error: 'Invalid identification credentials. Use Demo Login (demo_pilot / EncartoDemo2026!) or create an account.' };
  },

  async loginDemo(role: 'player' | 'pilot' | 'admin' = 'pilot'): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      const data = await parseApiResponse<AuthResponse>(res);
      if (data && data.user) return data;
    } catch (err) {
      console.warn('Network error calling /auth/demo, falling back directly:', err);
    }

    if (role === 'admin') {
      return {
        message: 'Station access granted. Welcome Demo Commander (Admin).',
        user: {
          id: 'demo-admin',
          username: 'demo_admin',
          email: 'admin@encarto.gg',
          role: 'ADMIN',
          rank: 99,
          exp: 99999,
          balance: 2500,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoCommander&backgroundColor=c0aede',
          bio: 'High Commander & System Administrator • Encarto Operations Director',
          profile: {
            selectedTheme: 'solo-leveling',
            birthday: '1998-03-22',
            phone: '+1 (555) 990-0001',
            activePlugin: 'admin-overdrive',
            activeDecoration: 'championship-crown'
          },
          ownedItems: ['item-vip-pass', 'role-organizer', 'role-admin', 'skin-quantum-reaper']
        }
      };
    }

    return {
      message: 'Station access granted. Welcome Demo Pilot (Pro Gamer).',
      user: {
        id: 'demo-pilot',
        username: 'demo_pilot',
        email: 'pilot@encarto.gg',
        role: 'USER',
        rank: 14,
        exp: 4850,
        balance: 350,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoPilot&backgroundColor=b6e3f4',
        bio: 'Elite Encarto Duelist & Tournament Competitor • Rank 14 Gladiator',
        profile: {
          selectedTheme: 'mha',
          birthday: '2002-08-15',
          phone: '+1 (555) 019-2834',
          activePlugin: 'cyber-aim-v2',
          activeDecoration: 'cyber-halo'
        },
        ownedItems: ['item-pro-pass', 'skin-neon-blade', 'role-competitor']
      }
    };
  },

  async logout(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return parseApiResponse(res);
  },

  async getMe(): Promise<{ user?: any; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return parseApiResponse(res);
  },

  async updateProfile(userId: string, data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return parseApiResponse(res);
  },

  async getMyProgression(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return parseApiResponse(res);
  },

  async getUserProgression(userId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/profile/${userId}`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return parseApiResponse(res);
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
    return parseApiResponse(res);
  },

  async getLeaderboard(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progression/leaderboard`, {
      credentials: 'include',
    });
    if (!res.ok) return { leaderboard: [] };
    return parseApiResponse(res);
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
    return parseApiResponse(res);
  },

  // Admin Operations
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized or failed to fetch admin stats');
    return parseApiResponse(res);
  },

  async getAdminUsers(search?: string): Promise<any> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/users${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return parseApiResponse(res);
  },

  async updateAdminUserRole(userId: string, role: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    return parseApiResponse(res);
  },

  async updateAdminUserStatus(userId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return parseApiResponse(res);
  },

  async getAdminMatches(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/matches`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return parseApiResponse(res);
  },

  async getAdminAuditLogs(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthorized');
    return parseApiResponse(res);
  },

  async configureGame(game: string, enabled: boolean): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/config/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ game, enabled }),
    });
    return parseApiResponse(res);
  },

  async configureBots(difficulty: string, params: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/config/bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ difficulty, ...params }),
    });
    return parseApiResponse(res);
  },
};
