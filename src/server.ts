import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

app.listen(env.server.port, () => {
  logger.info(
  {
    port: env.server.port,
    env: env.server.nodeEnv,
  },
  "Server started"
);
});