import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/errors";
import { logger } from "../config/logger";
import { env } from "../config/env";

const isDevelopment = env.server.nodeEnv === "development";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
     ...(isDevelopment && {
    stack: err.stack,
  }),
  });
}