import { Router } from "express";
import { productController } from "./product.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { authorize } from "@/middlewares/auth/authorize.middleware";
import { createProductSchema, getProductByIdSchema, getProductsQuerySchema } from "./product.schema";

export const productRouter = Router();

productRouter.post(
  "/",
  authorize("ADMIN"),
  validateRequest({ body: createProductSchema }),
  productController.create,
);
productRouter.get(
  "/",
  authorize("USER", "ADMIN"),
  validateRequest({ query: getProductsQuerySchema }),
  productController.getAll,
);
productRouter.get(
  "/:id",
  authorize("USER", "ADMIN"),
  validateRequest({ params: getProductByIdSchema }),
  productController.getById,
);

productRouter.put(
  "/:id",
  authorize("ADMIN"),
  validateRequest({ params: getProductByIdSchema }),
  validateRequest({ body: createProductSchema }),
  productController.update,
);
