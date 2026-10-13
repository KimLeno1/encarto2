import bcrypt from "bcryptjs";
import { prisma } from "../../server/db/client.js";
import { loginSchema } from "../../server/validators/auth.js";
import { createSessionToken } from "../../server/utils/session.js";
import { logAuditEvent } from "../../server/utils/audit.js";
import { applyApiCors, handleOptions, methodNotAllowed, readJsonBody, setSessionCookie } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!applyApiCors(req, res)) return res.status(403).json({ error: "Untrusted request origin." });
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return methodNotAllowed(res, ["POST", "OPTIONS"]);

  const parsed = loginSchema.safeParse(readJsonBody(req));
  if (!parsed.success) return res.status(400).json({ error: "Invalid login payload." });

  try {
    const { emailOrUsername, password } = parsed.data;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: { equals: emailOrUsername, mode: "insensitive" } },
        ],
      },
      include: { profile: true },
    });

    const dummyHash = "$2b$12$e8pAqv8y/R0yR3gXqA0t7uX2mE34p7m2fU4x7m8p9q1w2e3r4t5y6";
    const valid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !valid) return res.status(401).json({ error: "Invalid identification credentials." });

    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: Date.now(),
    });
    setSessionCookie(req, res, token);

    await logAuditEvent({
      action: "USER_LOGIN",
      performedBy: user.id,
      details: { username: user.username },
      ipAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || null,
    });

    return res.status(200).json({
      message: "Station access granted.",
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
      },
    });
  } catch {
    return res.status(503).json({ error: "Login service temporarily unavailable." });
  }
}
