import { env } from "@/config/env";

export const bullmqConnection = {
  url: env.redis.url,
  password: env.redis.password,
};
