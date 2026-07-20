import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

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