import { Router } from "express";
import healthRouter from "./health.route";
import { productRouter } from "@/modules/product/product.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/products", productRouter)

export default router;