import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { payoutAccountRepository } from "./payout-account.repository";
import type {
  CreatePayoutAccountInput,
  UpdatePayoutAccountInput,
} from "./payout-account.schema";

function maskSensitiveValue(value?: string | null, visibleTail = 4) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= visibleTail) {
    return "*".repeat(trimmed.length);
  }

  return `${"*".repeat(Math.max(2, trimmed.length - visibleTail))}${trimmed.slice(-visibleTail)}`;
}

function maskPayoutAccount(account: {
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  [key: string]: unknown;
}) {
  return {
    ...account,
    accountNumber: maskSensitiveValue(account.accountNumber ?? null, 4),
    ifscCode: maskSensitiveValue(account.ifscCode ?? null, 4),
    upiId: maskSensitiveValue(account.upiId ?? null, 4),
  };
}

export const payoutAccountService = {
  listPayoutAccounts: async (userId: string) => {
    const payoutAccounts = await payoutAccountRepository.listByUserId(userId);
    return payoutAccounts.map(maskPayoutAccount);
  },

  createPayoutAccount: async (
    userId: string,
    payoutAccountData: CreatePayoutAccountInput,
  ) => {
    const existingCount = await payoutAccountRepository.countActiveByUserId(userId);

    const payoutAccount = await payoutAccountRepository.createPayoutAccount({
      ...payoutAccountData,
      isDefault: existingCount === 0,
      user: {
        connect: { id: userId },
      },
    });

    return maskPayoutAccount(payoutAccount);
  },

  getPayoutAccountById: async (userId: string, payoutAccountId: string) => {
    const payoutAccount = await payoutAccountRepository.findById(
      userId,
      payoutAccountId,
    );

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found");
    }

    return maskPayoutAccount(payoutAccount);
  },

  updatePayoutAccount: async (
    userId: string,
    payoutAccountId: string,
    payoutAccountData: UpdatePayoutAccountInput,
  ) => {
    const payoutAccount = await payoutAccountRepository.updatePayoutAccount(
      userId,
      payoutAccountId,
      payoutAccountData,
    );

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found");
    }

    return maskPayoutAccount(payoutAccount);
  },

  setDefaultPayoutAccount: async (userId: string, payoutAccountId: string) => {
    const payoutAccount = await payoutAccountRepository.setDefault(
      userId,
      payoutAccountId,
    );

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found");
    }

    return maskPayoutAccount(payoutAccount);
  },

  deactivatePayoutAccount: async (userId: string, payoutAccountId: string) => {
    const payoutAccount = await payoutAccountRepository.deactivate(
      userId,
      payoutAccountId,
    );

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found");
    }

    return maskPayoutAccount(payoutAccount);
  },
};
