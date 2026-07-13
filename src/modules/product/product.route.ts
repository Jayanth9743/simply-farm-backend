import { Router } from "express";
import { productController } from "./product.controller";
import { validateRequest } from "@/middlewares/request/validate-request.middleware";
import { createProductSchema } from "./product.schema";

export const productRouter = Router();

productRouter.post("/",validateRequest({ body: createProductSchema }), productController.create);