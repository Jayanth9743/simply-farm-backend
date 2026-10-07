import type { Response } from "express";
import { env } from "@/config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    // "strict" is safe only while the client and this API are same-site. The
    // refresh call is a fetch from our own page, never a top-level navigation,
    // so strict does not break it. If the client is ever deployed to a
    // different registrable domain than the API, this must become
    // `sameSite: "none"` with `secure: true` or refresh stops working entirely
    // — and verifyRequestOrigin becomes the only CSRF defense left.
    sameSite: "strict",
    path: "/api/v1/auth",
    maxAge: env.jwt.refreshExpiresIn * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
}