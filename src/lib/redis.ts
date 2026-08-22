import {createClient} from "redis";
import {env} from "../config/env";
import { logger } from "@/config/logger";

export const redis = createClient({
  url: env.redis.url,
  password: env.redis.password,
});

redis.on("error", (err) => {
  logger.error({name: err.name, message: err.message, stack: err.stack}, "Redis error");
});