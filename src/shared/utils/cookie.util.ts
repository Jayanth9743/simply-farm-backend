import type { Response } from "express";
import { env } from "@/config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: env.jwt.refreshExpiresIn * 1000,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
}