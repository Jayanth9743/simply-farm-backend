import "dotenv/config";

import { envSchema } from "./schema";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.format());

  process.exit(1);
}

const data = parsed.data;

export const env = {
  server: {
    nodeEnv: data.NODE_ENV,
    port: data.PORT,
    trustProxy: data.TRUST_PROXY,
  },

  database: {
    url: data.DATABASE_URL,
  },

  jwt: {
    accessSecret: data.JWT_ACCESS_SECRET,
    refreshSecret: data.JWT_REFRESH_SECRET,
    accessExpiresIn: data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: data.JWT_REFRESH_EXPIRES_IN,
  },

  client: {
    url: data.CLIENT_URL,
  },

  logger: {
    level: data.LOG_LEVEL,
  },

  redis: {
    password: data.REDIS_PASSWORD,
    url: data.REDIS_URL,
  },
} as const;

export type Env = typeof env;