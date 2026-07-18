import type { Request, Response } from "express";

import { sendResponse } from "@/shared/responses";
import { productService } from "./product.service";
import { createProductSchema, GetProductsQueryInput, } from "./product.schema";
import { PRODUCT_MESSAGES } from "./product.constants";

export const productController = {
  async create(req: Request, res: Response) {
    const data = createProductSchema.parse(req.body);
    const product = await productService.createProduct(data);

    return sendResponse(res, {
      statusCode: 201,
        message: PRODUCT_MESSAGES.CREATED,
        data: product,
    });
  },

  async getAll(req: Request, res: Response) {
    const query = req.query as GetProductsQueryInput;
    const products = await productService.getProducts(query);
    return sendResponse(res, {
      statusCode: 200,
      message: PRODUCT_MESSAGES.FETCHED_ALL,
      data: products,
    });
  }
};