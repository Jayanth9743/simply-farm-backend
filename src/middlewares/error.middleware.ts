import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../shared/errors";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { Prisma } from "../../generated/prisma/client";

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

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
  const field = (err.meta?.target as string[])?.join(", ") ?? "field";
  return res.status(409).json({
    success: false,
    message: `${field} already exists`,
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