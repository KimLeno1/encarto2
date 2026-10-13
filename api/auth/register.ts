import bcrypt from "bcryptjs";
import { prisma } from "../../server/db/client.js";
import { registerSchema } from "../../server/validators/auth.js";
import { createSessionToken } from "../../server/utils/session.js";
import { logAuditEvent } from "../../server/utils/audit.js";
import { applyApiCors, handleOptions, methodNotAllowed, readJsonBody, setSessionCookie } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!applyApiCors(req, res)) return res.status(403).json({ error: "Untrusted request origin." });
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return methodNotAllowed(res, ["POST", "OPTIONS"]);

  const parsed = registerSchema.safeParse(readJsonBody(req));
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const { username, email, password, birthday, bio, avatarUrl } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: { equals: username, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === normalizedEmail) {
        return res.status(409).json({ error: "An account with this email address already exists." });
      }
      return res.status(409).json({ error: "This username is already taken. Please choose another." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        isAdmin: false,
        bio: bio || null,
        avatarUrl: avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(username),
        profile: { create: { selectedTheme: "mha", birthday: birthday || null } },
      },
      include: { profile: true },
    });

    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: Date.now(),
    });
    setSessionCookie(req, res, token);

    await logAuditEvent({
      action: "USER_REGISTERED",
      performedBy: user.id,
      details: { username: user.username, email: user.email },
      ipAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || null,
    });

    return res.status(201).json({
      message: "Account enlisted successfully.",
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
  } catch (error: any) {
    // Handle concurrent signups without leaking database details.
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "An account with those details already exists." });
    }
    return res.status(503).json({ error: "Registration service temporarily unavailable." });
  }
}
