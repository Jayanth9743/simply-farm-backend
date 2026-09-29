import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/shared/utils/jwt.util";
import { ApiError } from "@/shared/errors";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  next();
}