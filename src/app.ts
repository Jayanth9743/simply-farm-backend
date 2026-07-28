import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { registerMiddlewares } from "./middlewares";
import { env } from "./config/env";
import router from "./routes";
import { API_PREFIX } from "./shared/constants/api";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiSpec } from "@/shared/openapi/generate-spec";
import { NODE_ENV } from "./shared/constants/env.constants";

const app = express();

// Express application settings
app.disable("x-powered-by");
app.set("trust proxy", env.server.trustProxy);

registerMiddlewares(app);

app.use(API_PREFIX,router);

if (env.server.nodeEnv !== NODE_ENV.PRODUCTION) {
  const openApiSpec = generateOpenApiSpec();
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
}


app.use(notFoundMiddleware);

app.use(errorMiddleware);


export default app;