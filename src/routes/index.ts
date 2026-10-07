import { Router } from "express";
import healthRouter from "./health.route";
import { authRouter } from "@/modules/auth/auth.route";
import { userRouter } from "@/modules/user/user.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/user",userRouter);

export default router;