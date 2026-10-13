/**
 * Consolidated Vercel API entry point.
 *
 * Plain Vercel Functions do not implement Next.js catch-all file semantics.
 * vercel.json rewrites unmatched /api/* URLs to this concrete function, passing
 * the original API path as __encarto_path. Restore that path before Express
 * dispatches so the existing /api/auth, /api/admin, /api/progression and
 * /api/matchmaking routers behave exactly as they do on the Node server.
 */
import { app } from '../server/app.js';

type VercelRequest = {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  [key: string]: any;
};

export default function handler(req: VercelRequest, res: any) {
  const hostHeader = req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const currentUrl = new URL(req.url || '/', `https://${host || 'encarto.vercel.app'}`);
  const forwardedPath = currentUrl.searchParams.get('__encarto_path');

  if (!forwardedPath) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: 'Missing forwarded API path.' });
  }

  const normalizedPath = forwardedPath.split('/').filter(Boolean).join('/');
  if (!normalizedPath || normalizedPath === 'index') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: 'Invalid forwarded API path.' });
  }

  currentUrl.searchParams.delete('__encarto_path');
  const query = currentUrl.searchParams.toString();
  req.url = `/api/${normalizedPath}${query ? `?${query}` : ''}`;

  return app(req as any, res);
}
