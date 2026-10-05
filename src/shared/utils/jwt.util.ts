import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { env } from "@/config/env";

/**
 * Pinned explicitly on both sign and verify. Without an `algorithms` allowlist,
 * `jwt.verify` trusts whatever the token's own header asks for, which is the
 * entry point for algorithm-confusion attacks.
 */
const TOKEN_ALGORITHM = "HS256" as const;

export type AccessTokenPayload = {
  sub: string; // user id
  role: string;
};

export type RefreshTokenPayload = {
  sub: string; // user id
  jti: string; // unique token id, see signRefreshToken
  exp: number; // seconds since epoch, set by jsonwebtoken
};

export type IssuedRefreshToken = {
  token: string;
  jti: string;
  /** Derived from the token's own `exp` claim so the two can never drift. */
  expiresAt: Date;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    algorithm: TOKEN_ALGORITHM,
    expiresIn: env.jwt.accessExpiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret, {
    algorithms: [TOKEN_ALGORITHM],
  }) as AccessTokenPayload;
}

/**
 * The `jti` is what makes each refresh token unique.
 *
 * A JWT signed over `{ sub }` alone is fully deterministic: `iat` has only
 * second resolution and HS256 adds no nonce, so two tokens minted for the same
 * user within the same second were byte-identical. That collided with the
 * unique index on `refresh_tokens.token_hash` (surfacing as a spurious 409) and
 * made rotation inside that window a silent no-op. A random `jti` per token
 * removes the collision and gives each token a stable identifier for logging.
 */
export function signRefreshToken(payload: { sub: string }): IssuedRefreshToken {
  const jti = randomUUID();

  const token = jwt.sign(payload, env.jwt.refreshSecret, {
    algorithm: TOKEN_ALGORITHM,
    expiresIn: env.jwt.refreshExpiresIn,
    jwtid: jti,
  });

  const { exp } = jwt.decode(token) as { exp: number };

  return { token, jti, expiresAt: new Date(exp * 1000) };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret, {
    algorithms: [TOKEN_ALGORITHM],
  }) as RefreshTokenPayload;
}
