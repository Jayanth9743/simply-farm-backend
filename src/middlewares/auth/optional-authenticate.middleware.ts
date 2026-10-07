import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/shared/utils/jwt.util";

/**
 * Populates `req.user` when a valid access token is presented, and does
 * nothing at all otherwise.
 *
 * This is for public endpoints whose *response* widens for privileged callers
 * — the catalog list routes, where an admin may ask for inactive rows. The
 * strict `authenticate` middleware cannot serve those: it rejects an anonymous
 * request with a 401 before the handler runs, which would make the endpoint
 * private. A bad or expired token is treated the same as no token, so a stale
 * client still gets the public response instead of an error.
 *
 * Never use this in place of `authenticate` on a route that needs a known
 * caller — it makes no guarantee that `req.user` is set, so every handler
 * behind it must cope with an anonymous request.
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  try {
    req.user = verifyAccessToken(authHeader.slice(7));
  } catch {
    // Deliberately swallowed: see the note above.
  }

  next();
}
