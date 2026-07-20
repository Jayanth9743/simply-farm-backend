import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  PORT: z.coerce.number().int().positive(),
  TRUST_PROXY: z.coerce.number().int().nonnegative(),

  DATABASE_URL: z.url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.coerce.number(), // e.g. 900
  JWT_REFRESH_EXPIRES_IN: z.coerce.number(), // e.g. 604800

  CLIENT_URL: z.url(),

  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
});

export type EnvSchema = z.infer<typeof envSchema>;
