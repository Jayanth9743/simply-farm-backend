import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { sendResponse } from "@/shared/responses";

import type {
  CreatePayoutAccountInput,
  UpdatePayoutAccountInput,
} from "./payout-account.schema";
import { payoutAccountService } from "./payout-account.service";

function requireUserId(req: Request): string {
  const userId = req.user?.sub;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  return userId;
}

export const payoutAccountController = {
  listPayoutAccounts: async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const payoutAccounts = await payoutAccountService.listPayoutAccounts(userId);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Payout accounts retrieved successfully",
      data: { payoutAccounts },
    });
  },

  createPayoutAccount: async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const payoutAccount = await payoutAccountService.createPayoutAccount(
      userId,
      req.body as CreatePayoutAccountInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Payout account created successfully",
      data: { payoutAccount },
    });
  },

  getPayoutAccountById: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const payoutAccount = await payoutAccountService.getPayoutAccountById(
      userId,
      id,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Payout account retrieved successfully",
      data: { payoutAccount },
    });
  },

  updatePayoutAccount: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const payoutAccount = await payoutAccountService.updatePayoutAccount(
      userId,
      id,
      req.body as UpdatePayoutAccountInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Payout account updated successfully",
      data: { payoutAccount },
    });
  },

  setDefaultPayoutAccount: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const payoutAccount = await payoutAccountService.setDefaultPayoutAccount(
      userId,
      id,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Default payout account updated successfully",
      data: { payoutAccount },
    });
  },

  deactivatePayoutAccount: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const payoutAccount = await payoutAccountService.deactivatePayoutAccount(
      userId,
      id,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Payout account deactivated successfully",
      data: { payoutAccount },
    });
  },
};
