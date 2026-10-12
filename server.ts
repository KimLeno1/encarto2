import http from 'http';
import { app } from './server/app.js';
import { env } from './server/config/env.js';
import { prisma } from './server/db/client.js';
import { setupSocketIO } from './server/socket/index.js';
import { createServer as createViteServer } from 'vite';

async function bootstrap() {
  const server = http.createServer(app);

  // Initialize Socket.IO real-time server
  setupSocketIO(server);

  // Mount Vite development middlewares in dev mode
  if (env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`[ENCARTO SERVER] Listening on http://0.0.0.0:${port} (${env.NODE_ENV})`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[ENCARTO SERVER] Received ${signal}. Closing gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('[ENCARTO SERVER] Database disconnected.');
      } catch (err) {
        console.error('[ENCARTO SERVER] Error during db disconnect:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[ENCARTO SERVER] Failed to start:', err);
  process.exit(1);
});
