import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma";

class NotFoundInTransaction extends Error {}

export const payoutAccountRepository = {
  async createPayoutAccount(data: Prisma.PayoutAccountCreateInput) {
    return prisma.payoutAccount.create({
      data,
    });
  },

  async setDefault(userId: string, accountId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.payoutAccount.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        const result = await tx.payoutAccount.updateMany({
          where: { id: accountId, userId, status: "ACTIVE" },
          data: { isDefault: true },
        });

        if (result.count === 0) {
          throw new NotFoundInTransaction("Payout account not found");
        }

        return tx.payoutAccount.findFirst({
          where: { id: accountId, userId },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundInTransaction) {
        return null;
      }

      throw error;
    }
  },

  async findById(userId: string, accountId: string) {
    return prisma.payoutAccount.findFirst({
      where: { id: accountId, userId, status: "ACTIVE" },
    });
  },

  async listByUserId(userId: string) {
    return prisma.payoutAccount.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  },

  async countActiveByUserId(userId: string) {
    return prisma.payoutAccount.count({
      where: { userId, status: "ACTIVE" },
    });
  },

  async updatePayoutAccount(
    userId: string,
    accountId: string,
    accountData: Prisma.PayoutAccountUpdateInput,
  ) {
    const result = await prisma.payoutAccount.updateMany({
      where: { id: accountId, userId, status: "ACTIVE" },
      data: accountData,
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.payoutAccount.findFirst({
      where: { id: accountId, userId },
    });
  },

  async deactivate(userId: string, accountId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const result = await tx.payoutAccount.updateMany({
          where: { id: accountId, userId, status: "ACTIVE" },
          data: { status: "INACTIVE", isDefault: false },
        });

        if (result.count === 0) {
          throw new NotFoundInTransaction("Payout account not found");
        }

        return tx.payoutAccount.findFirst({
          where: { id: accountId, userId },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundInTransaction) {
        return null;
      }

      throw error;
    }
  },
};
