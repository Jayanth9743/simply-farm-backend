import { Prisma } from "@prisma/client";

import { productRepository } from "./product.repository";
import { CreateProductInput } from "./product.schema";

export const productService = {
    async create(data:CreateProductInput) {
    const productData: Prisma.ProductCreateInput = {
      ...data,
      price: new Prisma.Decimal(data.price),
    };

    return productRepository.create(productData);
  },
}