import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma";

export const authRepository = {
  findByPhoneOrEmail(phone: string, email?: string) {
    const conditions: Prisma.UserWhereInput[] = [{ phone }];
    if (email) conditions.push({ email });

    return prisma.user.findFirst({
      where: { OR: conditions },
    });
  },

  create(userData: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: userData,
    });
  },

  saveRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return prisma.refreshToken.create({
      data: data,
    });
  },
};
