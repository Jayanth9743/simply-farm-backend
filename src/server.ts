import app from "./app";

import { env } from "./config/env";

import { logger } from "./config/logger";

import { redis } from "./lib/redis";

const startServer = async () => {
  await redis.connect();

  app.listen(env.server.port, () => {
    logger.info(
      {
        port: env.server.port,
        env: env.server.nodeEnv,
      },
      "Server started"
    );
  });
};

startServer().catch((error) => {
  logger.fatal({ error }, "Failed to start server");
  process.exit(1);
});