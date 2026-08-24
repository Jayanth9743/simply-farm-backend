import { Prisma } from "../../../generated/prisma/client";
import type {
  CreateProductInput,
  GetProductsQueryInput,
} from "./product.schema";

import { productRepository } from "./product.repository";
import { redis } from "@/lib/redis";
import { ApiError } from "@/shared/errors";
import { StatusCodes } from "http-status-codes";
import { PRODUCT_MESSAGES } from "./product.constants";
import { logger } from "@/config/logger";

export const productService = {
  async createProduct(data: CreateProductInput) {
    return productRepository.create({
      ...data,
      price: new Prisma.Decimal(data.price),
    });
  },

  async getProducts(query: GetProductsQueryInput) {
    const { page, limit, category, isActive, sortBy, order } = query;

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

  async getProductById(id: string) {
    const key = `product:${id}`;
    let cachedProduct: string | null = null;
    try{
       cachedProduct = await redis.get(key);
    } catch (error) {
      logger.warn({ error, key }, "Error occurred while fetching product from Redis");
    }

    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }
    const product = await productRepository.findById(id);

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, PRODUCT_MESSAGES.NOT_FOUND);
    }

   try{
     await redis.setEx(key, 300, JSON.stringify(product)); // Cache for 5 minutes
   }catch (error) {
     logger.warn({ error }, "Error occurred while caching product in Redis");
   }
    return product;
  },

  async updateProduct(id: string, data: Partial<CreateProductInput>) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, PRODUCT_MESSAGES.NOT_FOUND);
    }

    const updatedProduct = await productRepository.update(id, {
      ...data,
      price: data.price ? new Prisma.Decimal(data.price) : product.price,
    });

    const key = `product:${id}`;
    try {
      await redis.del(key); // Invalidate cache
    } catch (error) {
      logger.error({ error }, "Error occurred while deleting product from Redis");
    }
    return updatedProduct;
  },
};
