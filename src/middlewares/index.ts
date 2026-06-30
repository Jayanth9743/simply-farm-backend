import { Express } from "express";

import { registerRequestMiddlewares } from "./request";
import { registerSecurityMiddlewares } from "./security";

export function registerMiddlewares(app: Express) {
  registerRequestMiddlewares(app);

  registerSecurityMiddlewares(app);
}