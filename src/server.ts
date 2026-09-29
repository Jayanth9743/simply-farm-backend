import app from "./app";

import { env } from "./config/env";

import { logger } from "./config/logger";
import { connectRedis } from "./config/redis";

import { redis } from "./lib/redis";

async function bootstrap() {
  await connectRedis();

  const server = app.listen(env.server.port, () => {
    logger.info(
      {
        port: env.server.port,
        env: env.server.nodeEnv,
      },
      "Server started",
    );
  });
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutdown signal received");

    server.close(async () => {
      try {
        if (redis.isOpen) {
          await redis.quit();
        }

        logger.info("Server shutdown complete");
        process.exit(0);
      } catch (error) {
        logger.error(
          { error },
          "Error during shutdown",
        );

        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap();