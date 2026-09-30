import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { registerSchema } from "./auth.schema";
import { rateLimit } from "@/middlewares/rate-limit.middleware";

export const authRouter = Router();

authRouter.post("/register",rateLimit({ limit: 5, windowSeconds: 3600, keyPrefix: "rl:register" }),validateRequest({ body: registerSchema }), authController.register);