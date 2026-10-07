import { Router } from "express";
import healthRouter from "./health.route";
import { authRouter } from "@/modules/auth/auth.route";
import { catalogRouter } from "@/modules/catalog/catalog.route";
import { userRouter } from "@/modules/user/user.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/user",userRouter);
router.use("/catalog", catalogRouter);

export default router;