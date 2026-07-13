import type { Request, Response } from "express";

import { sendResponse } from "@/shared/responses";
import { productService } from "./product.service";
import { createProductSchema } from "./product.schema";
import { PRODUCT_MESSAGES } from "./product.constants";

export const productController = {
  async create(req: Request, res: Response) {
    const data = createProductSchema.parse(req.body);
    const product = await productService.create(data);

    return sendResponse(res, {
      statusCode: 201,
        message: PRODUCT_MESSAGES.CREATED,
        data: product,
    });
  }
}