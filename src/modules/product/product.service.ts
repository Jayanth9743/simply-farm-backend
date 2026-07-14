import { Prisma } from "@prisma/client";
import type { CreateProductInput, GetProductsQueryInput } from "./product.schema";

import { productRepository } from "./product.repository";

export const productService = {
  async createProduct(data: CreateProductInput) {
    return productRepository.create({
      ...data,
      price: new Prisma.Decimal(data.price),
    });
  },

  async getProducts(query: GetProductsQueryInput) {
    const {
      page,
      limit,
      category,
      isActive,
      sortBy,
      order,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const { products, total } = await productRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};