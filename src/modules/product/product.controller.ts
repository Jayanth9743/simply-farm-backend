import type { Request, Response } from "express";

import { sendResponse } from "@/shared/responses";
import { productService } from "./product.service";
import { createProductSchema, GetProductByIdInput, GetProductsQueryInput } from "./product.schema";
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
  },

  async getById(req: Request<GetProductByIdInput>, res: Response) {
    const { id } = req.params;

    const product = await productService.getProductById(id);
    return sendResponse(res, {
      statusCode: 200,
      message: PRODUCT_MESSAGES.FETCHED,
      data: product,
    });
  },

  async update(req: Request<GetProductByIdInput>, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const product = await productService.updateProduct(id, data);
    return sendResponse(res, {
      statusCode: 200,
      message: PRODUCT_MESSAGES.UPDATED,
      data: product,
    });
  }
};
