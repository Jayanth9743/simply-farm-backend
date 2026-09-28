import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { redis } from "@/lib/redis";
import { logger } from "@/config/logger";
import { ApiError } from "@/shared/errors/api-error";

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
  keyPrefix: string;
  /** If Redis is unavailable: true = let the request through, false = reject with 503. */
  failOpen?: boolean;
};

// Atomic: increment, and (re)apply the TTL if the key has none.
// Returns { count, ttlSeconds }.
const INCREMENT_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { current, ttl }
`;

export function rateLimit({
  limit,
  windowSeconds,
  keyPrefix,
  failOpen = true,
}: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip;
    if (!identifier) return next();

    const key = `${keyPrefix}:${identifier}`;

    let count: number;
    let ttl: number;

    // Only the Redis interaction is inside try — over-limit is handled below.
    try {
      if (!redis.isReady) throw new Error("Redis client not ready");

      const result = (await redis.eval(INCREMENT_SCRIPT, {
        keys: [key],
        arguments: [String(windowSeconds)],
      })) as [number, number];

      [count, ttl] = result;
    } catch (err) {
      logger.warn(
        { err, requestId: req.requestId, keyPrefix },
        "Rate limiter unavailable",
      );
      if (failOpen) return next();
      return next(
        new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Service temporarily unavailable."),
      );
    }

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));

    if (count > limit) {
      res.setHeader("Retry-After", ttl);
      return next(
        new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many requests. Please try again later."),
      );
    }

    next();
  };
}