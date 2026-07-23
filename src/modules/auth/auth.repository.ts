import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  saveRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return prisma.refreshToken.create({ data });
  },

  findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
},

findRefreshTokenByHash(tokenHashed: string ) {
  return prisma.refreshToken.findUnique({ where: { tokenHashed } });
},

revokeRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
},
};