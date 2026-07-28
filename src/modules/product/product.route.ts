import { Router } from "express";
import { productController } from "./product.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { authorize } from "@/middlewares/auth/authorize.middleware";
import { createProductSchema, getProductsQuerySchema } from "./product.schema";

export const productRouter = Router();

productRouter.post("/",authorize("ADMIN"),validateRequest({ body: createProductSchema }), productController.create);
productRouter.get("/",authorize("USER"),validateRequest({ query: getProductsQuerySchema }), productController.getAll);