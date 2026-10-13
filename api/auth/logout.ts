import { applyApiCors, clearSessionCookie, handleOptions, methodNotAllowed } from "../../server/vercelApiHttp.js";

export default function handler(req: any, res: any) {
  if (!applyApiCors(req, res)) return res.status(403).json({ error: "Untrusted request origin." });
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return methodNotAllowed(res, ["POST", "OPTIONS"]);
  clearSessionCookie(res);
  return res.status(200).json({ message: "Session terminated. Station disconnected." });
}
