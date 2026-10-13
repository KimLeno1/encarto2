type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  setHeader(name: string, value: string | number | readonly string[]): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  end(body?: string): void;
};

export function applyApiCors(req: ApiRequest, res: ApiResponse): boolean {
  const originHeader = req.headers?.origin;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  const allowed = (process.env.CORS_ORIGIN || "https://encarto.vercel.app,http://localhost:3000")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");

  if (origin && !allowed.includes(origin)) return false;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return true;
}

export function handleOptions(req: ApiRequest, res: ApiResponse): boolean {
  if (req.method !== "OPTIONS") return false;
  res.status(204).end();
  return true;
}

export function readJsonBody(req: ApiRequest): Record<string, unknown> {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === "string") {
    try {
      const value: unknown = JSON.parse(req.body);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
    } catch {
      // The route returns a controlled validation response for malformed JSON.
    }
  }
  return {};
}

export function readSessionToken(req: ApiRequest): string | null {
  const authorization = req.headers?.authorization;
  const auth = Array.isArray(authorization) ? authorization[0] : authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  const cookieHeader = req.headers?.cookie;
  const cookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  if (!cookie) return null;

  for (const part of cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === "encarto_session") {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
}

export function setSessionCookie(req: ApiRequest, res: ApiResponse, token: string): void {
  const forwardedProto = req.headers?.["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const secure = process.env.NODE_ENV === "production" || proto === "https";
  res.setHeader(
    "Set-Cookie",
    `encarto_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure ? "; Secure" : ""}`
  );
}

export function clearSessionCookie(res: ApiResponse): void {
  res.setHeader("Set-Cookie", "encarto_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure");
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]): void {
  res.setHeader("Allow", allowed.join(", "));
  res.status(405).json({ error: "Method not allowed.", allowed });
}

export function apiFailure(res: ApiResponse, status: number, error: string): void {
  res.status(status).json({ error });
}
