import type { RequestHandler } from "express";
import { supabase, supabaseAuthIssuer } from "../services/supabase.js";

// This part adds a `user` property to the Express Request object, which can be used in route handlers after authentication.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string };
    }
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const requireAuth: RequestHandler = async (req, res, next) => {
  const bearer = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");

  const unauthorized = () => {
    res.set("WWW-Authenticate", "Bearer");
    res.status(401).json({ message: "A valid Supabase access token is required" });
  };

  if (!bearer) {
    unauthorized();
    return;
  }

  try {
    // Decode only to reject unsupported formats. Identity comes from getClaims verification.
    const header = JSON.parse(Buffer.from(bearer[1].split(".")[0], "base64url").toString());
    if (!header || !["ES256", "RS256", "HS256"].includes(header.alg)) {
      unauthorized();
      return;
    }

    const { data, error } = await supabase.auth.getClaims(bearer[1]);

    if (error || !data) {
      if (error && (error.status === 0 || (error.status ?? 0) >= 500)) {
        res.status(503).json({ message: "Authentication service is unavailable" });
        return;
      }
      unauthorized();
      return;
    }

    const claims = data.claims;
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const now = Math.floor(Date.now() / 1000);

    // Only accept user tokens issued for this project's authenticated audience.
    if (
      claims.iss !== supabaseAuthIssuer ||
      !audience.includes("authenticated") ||
      claims.role !== "authenticated" ||
      typeof claims.sub !== "string" ||
      !uuidPattern.test(claims.sub) ||
      typeof claims.exp !== "number" ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now ||
      (claims.nbf !== undefined &&
        (typeof claims.nbf !== "number" || !Number.isFinite(claims.nbf) || claims.nbf > now))
    ) {
      unauthorized();
      return;
    }

    req.user = {
      id: claims.sub,
      ...(typeof claims.email === "string" ? { email: claims.email } : {}),
    };
    next();
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      unauthorized();
      return;
    }
    next(error);
  }
};
