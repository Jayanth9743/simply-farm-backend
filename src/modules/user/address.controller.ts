import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { sendResponse } from "@/shared/responses";

import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "./address.schema";
import { addressService } from "./address.service";

function requireUserId(req: Request): string {
  const userId = req.user?.sub;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  return userId;
}

export const addressController = {
  listAddresses: async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const addresses = await addressService.listAddresses(userId);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Addresses retrieved successfully",
      data: { addresses },
    });
  },

  createAddress: async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const address = await addressService.createAddress(
      userId,
      req.body as CreateAddressInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Address created successfully",
      data: { address },
    });
  },

  getAddressById: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const address = await addressService.getAddressById(userId, id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Address retrieved successfully",
      data: { address },
    });
  },

  updateAddress: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    const updatedAddress = await addressService.updateAddress(
      userId,
      id,
      req.body as UpdateAddressInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Address updated successfully",
      data: { address: updatedAddress },
    });
  },

  deleteAddress: async (req: Request<{ id: string }>, res: Response) => {
    const userId = requireUserId(req);
    const { id } = req.params;
    await addressService.deleteAddress(userId, id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Address deleted successfully",
    });
  },
};
