import { prisma } from "../../server/db/client.js";
import { applyApiCors, handleOptions, methodNotAllowed } from "../../server/vercelApiHttp.js";

export default async function handler(req: any, res: any) {
  if (!applyApiCors(req, res)) return res.status(403).json({ error: "Untrusted request origin." });
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return methodNotAllowed(res, ["GET", "OPTIONS"]);

  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "healthy",
      database: "PostgreSQL",
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({
      status: "degraded",
      database: "PostgreSQL",
      connected: false,
      timestamp: new Date().toISOString(),
      error: "Database connection failed. Check DATABASE_URL and database availability.",
    });
  }
}
