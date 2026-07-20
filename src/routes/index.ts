import { Router } from "express";
import healthRouter from "./health.route";
import { productRouter } from "@/modules/product/product.route";
import { authRouter } from "@/modules/auth/auth.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/products", productRouter)
router.use("/auth", authRouter);

export default router;