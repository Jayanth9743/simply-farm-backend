import helmet from "helmet";
import cors from "cors";
import { Express } from "express";
import { env } from "../../config/env";

export function registerSecurityMiddlewares(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

   app.use(
    cors({
      origin: env.client.url,
      credentials: true,
    })
  );
}