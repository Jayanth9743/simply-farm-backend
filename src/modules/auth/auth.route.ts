import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { authenticate } from "@/middlewares/auth/authenticate.middleware";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest({ body: registerSchema }),
  authController.register
);

authRouter.post(
  "/login",
  validateRequest({ body: loginSchema }),
  authController.login
);

authRouter.post(
  "/refresh",
  authController.refresh
);

authRouter.post(
  "/logout",
  authenticate,
  authController.logout
);