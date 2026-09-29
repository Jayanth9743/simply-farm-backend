import { createClient } from "redis";

import { env } from "@/config/env";
import { logger } from "@/config/logger";

export const redis = createClient({
  url: env.redis.url,
  password: env.redis.password,
});

redis.on("connect", () => {
  logger.info("Redis connecting");
});

redis.on("ready", () => {
  logger.info("Redis ready");
});

redis.on("reconnecting", () => {
  logger.warn("Redis reconnecting");
});

redis.on("error", (err) => {
  logger.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    "Redis error",
  );
});

redis.on("end", () => {
  logger.warn("Redis connection closed");
});