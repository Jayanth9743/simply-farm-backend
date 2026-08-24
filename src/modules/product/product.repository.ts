
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma";


export const productRepository = {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
    });
  },

  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const {
      skip,
      take,
      where = {},
      orderBy = { createdAt: "asc" },
    } = params;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      prisma.product.count({
        where,
      }),
    ]);

    return {
      products,
      total,
    };
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }
};