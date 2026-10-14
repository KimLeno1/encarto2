import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.ts';
import { checkDatabaseConnection, prisma } from './db/client.ts';
import { authRouter } from './routes/authRoutes.ts';
import { aiRouter } from './routes/aiRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

export const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite frontend uses CDN and dynamic scripts
  })
);

// CORS: allow only explicitly configured browser origins. Requests without an Origin
// (for example, server-to-server health checks) are not browser CORS requests.
const allowedOrigins = new Set(
  env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

 // CORS headers alone do not prevent a cross-origin request from reaching a state-changing
 // endpoint. Enforce the Origin allowlist for browser mutation requests as a CSRF defense.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get('Origin');
  if (origin && !allowedOrigins.has(origin)) {
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
import { matchmakingRouter } from './routes/matchmakingRoutes.ts';
app.use('/api/matchmaking', matchmakingRouter);

// Progression, Rank Tiers, and Match History API
import { progressionRouter } from './routes/progressionRoutes.ts';
app.use('/api/progression', progressionRouter);

// Admin Control Panel API
import { adminRouter } from './routes/adminRoutes.ts';
app.use('/api/admin', adminRouter);

// Authenticated AI provider and Gemini proxy APIs; provider keys never enter the frontend bundle.
app.use('/api/ai', aiRouter);

// Centralized error handler
app.use(errorHandler);
