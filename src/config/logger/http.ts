import pinoHttp from "pino-http";

import { logger } from "./index";

export const httpLoggingMiddleware  = pinoHttp({
  logger,
});