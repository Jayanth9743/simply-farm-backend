import express from "express";

import routes from "./routes";
import { API_PREFIX } from "./shared/constants/api";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

/**
 * Basic Express Configuration
 */
app.disable("x-powered-by");

/**
 * Built-in Middleware
 */
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/**
 * API Routes
 */
app.use(API_PREFIX, routes);

app.use(errorMiddleware);

export default app;