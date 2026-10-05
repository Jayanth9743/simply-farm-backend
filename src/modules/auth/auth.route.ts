import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { loginSchema, registerSchema } from "./auth.schema";
import { rateLimit } from "@/middlewares/rate-limit.middleware";
import "./auth.openapi";

export const authRouter = Router();

authRouter.post(
  "/register",
  rateLimit({ limit: 5, windowSeconds: 3600, keyPrefix: "rl:register" }),
  validateRequest({ body: registerSchema }),
  authController.register,
);
authRouter.post(
  "/login",
  rateLimit({ limit: 5, windowSeconds: 3600, keyPrefix: "rl:login" }),
  validateRequest({ body: loginSchema }),
  authController.login,
);
authRouter.post(
  "/refresh",
  rateLimit({ limit: 10, windowSeconds: 3600, keyPrefix: "rl:refresh" }),
  authController.refresh,
);
authRouter.post(
  "/logout",
  rateLimit({ limit: 10, windowSeconds: 3600, keyPrefix: "rl:logout" }),
  authController.logout,
);
