import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { loginSchema, registerSchema } from "./auth.schema";
import { rateLimit } from "@/middlewares/rate-limit.middleware";
import { verifyRequestOrigin } from "@/middlewares/security/verify-origin.middleware";
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
// These two read the refresh token from a cookie rather than an Authorization
// header, which makes them the only CSRF-reachable routes in the API. The origin
// check runs ahead of the rate limiter on purpose: a forged request arrives from
// the victim's IP, so checking first stops an attacker from burning the victim's
// refresh budget with requests that were going to be rejected anyway.
authRouter.post(
  "/refresh",
  verifyRequestOrigin,
  rateLimit({ limit: 10, windowSeconds: 3600, keyPrefix: "rl:refresh" }),
  authController.refresh,
);
authRouter.post(
  "/logout",
  verifyRequestOrigin,
  rateLimit({ limit: 10, windowSeconds: 3600, keyPrefix: "rl:logout" }),
  authController.logout,
);
