import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { Prisma } from "../../../generated/prisma";
import { ADDRESS_MESSAGES } from "./address.constant";
import { addressRepository } from "./address.repository";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "./address.schema";

/** Turns the reference counts into something a user can act on. */
function describeReferences({
  listings,
  equipment,
}: {
  listings: number;
  equipment: number;
}) {
  const parts: string[] = [];

  if (listings > 0) {
    parts.push(`${listings} produce listing${listings === 1 ? "" : "s"}`);
  }

  if (equipment > 0) {
    parts.push(`${equipment} equipment listing${equipment === 1 ? "" : "s"}`);
  }

  return `This address is used by ${parts.join(" and ")} and cannot be deleted`;
}

export const addressService = {
  listAddresses: async (userId: string) => {
    return addressRepository.listAddressesByUserId(userId);
  },

  createAddress: async (userId: string, addressData: CreateAddressInput) => {
    return addressRepository.createAddress({
      ...addressData,
      user: {
        connect: { id: userId },
      },
    });
  },

  getAddressById: async (userId: string, id: string) => {
    const address = await addressRepository.findById(id);

    if (!address || address.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    return address;
  },

  updateAddress: async (
    userId: string,
    id: string,
    addressData: UpdateAddressInput,
  ) => {
    const existingAddress = await addressRepository.findById(id);

    if (!existingAddress || existingAddress.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    return addressRepository.updateAddress(id, addressData);
  },

  deleteAddress: async (userId: string, id: string) => {
    const existingAddress = await addressRepository.findById(id);

    if (!existingAddress || existingAddress.userId !== userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    const references = await addressRepository.countReferences(id);

    if (references.total > 0) {
      throw new ApiError(StatusCodes.CONFLICT, describeReferences(references));
    }

    try {
      await addressRepository.deleteAddress(id);
    } catch (error) {
      // A listing or equipment row can be created between the count above and
      // this delete. The database constraint is the real guard, so translate it
      // rather than letting it surface as a 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        throw new ApiError(StatusCodes.CONFLICT, ADDRESS_MESSAGES.IN_USE);
      }

      throw error;
    }
  },
};
