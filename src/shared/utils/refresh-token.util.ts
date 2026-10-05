import { createHmac } from "node:crypto";

import { env } from "@/config/env";

/**
 * Keyed hash rather than a bare SHA-256 digest, so a leaked database dump alone
 * is not enough to recognise or forge a usable refresh token — an attacker also
 * needs the secret.
 *
 * Reuses `JWT_REFRESH_SECRET` as the HMAC key to avoid introducing another
 * required environment variable. Rotating that secret invalidates every stored
 * refresh token, which is the behaviour you want from a secret rotation.
 */
export function hashRefreshToken(token: string): string {
  return createHmac("sha256", env.jwt.refreshSecret)
    .update(token)
    .digest("hex");
}
