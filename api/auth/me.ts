import { prisma } from "../../server/db/client.js";
import { verifySessionToken } from "../../server/utils/session.js";
import { applyApiCors, handleOptions, methodNotAllowed, readSessionToken } from "../../server/vercelApiHttp.js";

export default async function handler(req: any, res: any) {
  if (!applyApiCors(req, res)) return res.status(403).json({ error: "Untrusted request origin." });
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return methodNotAllowed(res, ["GET", "OPTIONS"]);

  const token = readSessionToken(req);
  const session = token ? verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ error: "Authentication required. Please log in." });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true, items: { include: { item: true } } },
    });
    if (!user) return res.status(401).json({ error: "Session user no longer exists. Please log in again." });

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        rank: user.rank,
        exp: user.exp,
        balance: Number(user.balance),
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        profile: user.profile,
        ownedItems: user.items.map((item) => item.itemId),
      },
    });
  } catch {
    return res.status(503).json({ error: "Authentication service temporarily unavailable." });
  }
}
