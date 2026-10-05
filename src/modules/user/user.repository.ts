import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma";

/**
 * Deliberately narrower than Prisma's generated input types.
 *
 * `Prisma.UserUpdateInput` accepts every column, so a caller that forwards an
 * unvalidated request body can write `role`, `status` or `passwordHash`. Naming
 * the writable fields explicitly makes that a compile error instead of a
 * privilege escalation, independent of whatever validation the route applies.
 */
export type CreateUserData = {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
};

export type UpdateUserData = {
  name?: string;
  phone?: string;
  email?: string;
};

export const userRepository = {
  async list(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const {
      skip,
      take,
      cursor,
      where = {},
      orderBy = { createdAt: "asc" },
    } = params;
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total };
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(userData: CreateUserData) {
    return prisma.user.create({
      data: userData,
    });
  },

  async update(id: string, userData: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data: userData,
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};
