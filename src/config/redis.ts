import { redis } from "@/lib/redis";
import { logger } from "./logger";

export async function connectRedis() {
  try {
    await redis.connect();
    logger.info("Redis connected successfully");
  } catch (error) {
    logger.warn({ error }, "Redis unavailable. Continuing without Redis.");
  }
}
