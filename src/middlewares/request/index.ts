import express, { Express } from "express";
import compression from "compression";
import { httpLoggingMiddleware  } from "../../config/logger/http";

export function registerRequestMiddlewares(app: Express) {
  app.use(httpLoggingMiddleware  );

  app.use(compression());

  app.use(express.json());

  app.use(
    express.urlencoded({
      extended: true,
    }),
  );
}
