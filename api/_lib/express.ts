import { app } from '../../server/app.js';

// Explicit Vercel route files re-export this Express handler for legacy feature routes.
// Critical auth and health endpoints use native handlers instead.
export default app;
