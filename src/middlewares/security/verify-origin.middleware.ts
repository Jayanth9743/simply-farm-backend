import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "@/config/env";
import { ApiError } from "@/shared/errors/api-error";

// Validated as a URL by the env schema, so this cannot throw at startup.
const ALLOWED_ORIGIN = new URL(env.client.url).origin;

/** Reduces an Origin or Referer value to a bare origin. Returns null if unusable. */
function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Rejects cross-site state-changing requests to cookie-authenticated routes.
 *
 * Mount this on any route that reads a credential from `req.cookies`. Routes
 * behind `authenticate` do not need it: a Bearer token lives in a header, which
 * a browser never attaches to a cross-site request on the attacker's behalf.
 *
 * Note that CORS is not a substitute. A cross-site form POST is a "simple
 * request", so it is dispatched without a preflight; the browser merely hides
 * the response from the attacker. The side effect still happens. This check
 * runs before the handler and so stops the request regardless of content-type
 * or which body parsers are registered.
 */
export function verifyRequestOrigin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.origin ?? req.headers.referer;

  // Neither header present. This cannot be the browser-driven cross-site POST
  // we are guarding against, because browsers always set Origin on non-GET
  // requests. It is a non-browser caller (mobile app, curl, server-to-server),
  // which has no victim cookie to ride, so allowing it widens nothing. Flip
  // this to a reject if these routes are ever browser-only by policy.
  if (!header) {
    return next();
  }

  const requestOrigin = toOrigin(header);

  // Opaque or malformed values land here: a sandboxed iframe sends the literal
  // `Origin: null`, and a proxy can truncate Referer. Both are untrustworthy,
  // so reject rather than fall through.
  if (requestOrigin === null || requestOrigin !== ALLOWED_ORIGIN) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Invalid request origin"));
  }

  next();
}
