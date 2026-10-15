import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { checkDatabaseConnection, prisma } from './db/client.js';
import { authRouter } from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite frontend uses CDN and dynamic scripts
  })
);

// CORS: allow explicitly configured browser origins and APP_URL
const configuredOrigins = new Set(
  env.CORS_ORIGIN.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)
);
if (process.env.APP_URL) {
  configuredOrigins.add(process.env.APP_URL.trim().replace(/\/$/, ''));
}

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true;
  const normalized = origin.trim().replace(/\/$/, '');
  if (configuredOrigins.has(normalized)) return true;
  if (process.env.APP_URL && normalized === process.env.APP_URL.trim().replace(/\/$/, '')) return true;
  if (env.NODE_ENV !== 'production') {
    if (normalized.includes('localhost') || normalized.includes('127.0.0.1') || normalized.endsWith('.run.app')) {
      return true;
    }
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

// Enforce the Origin allowlist for browser mutation requests as a CSRF defense.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get('Origin');
  if (origin && !isOriginAllowed(origin)) {
    res.status(403).json({ error: 'Untrusted request origin.' });
    return;
  }

  next();
});

// Request parsing & limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Request logging in development/production
if (env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// Health checks
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

app.get('/api/health/database', async (req: Request, res: Response) => {
  const isConnected = await checkDatabaseConnection();
  if (isConnected) {
    res.json({
      status: 'healthy',
      database: 'PostgreSQL',
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'degraded',
      database: 'PostgreSQL',
      connected: false,
      timestamp: new Date().toISOString(),
      message: 'Database check failed or running in preview mode without active DB socket.',
    });
  }
});

// Auth and Profile API
app.use('/api/auth', authRouter);

// Matchmaking and Matches API
import { matchmakingRouter } from './routes/matchmakingRoutes.js';
app.use('/api/matchmaking', matchmakingRouter);

// Progression, Rank Tiers, and Match History API
import { progressionRouter } from './routes/progressionRoutes.js';
app.use('/api/progression', progressionRouter);

// Admin Control Panel API
import { adminRouter } from './routes/adminRoutes.js';
app.use('/api/admin', adminRouter);

// Centralized error handler
app.use(errorHandler);
