import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";


export const productRepository = {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
    });
  },
};