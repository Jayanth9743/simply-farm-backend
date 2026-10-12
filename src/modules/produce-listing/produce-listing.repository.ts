import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma";

import type { CreateProduceListingInput } from "./produce-listing.schema";

export const produceListingRepository = {
  async createProduceListing(
    sellerId: string,
    produceListingData: CreateProduceListingInput,
  ) {
    const { totalQuantity, ...listingData } = produceListingData;

    return prisma.$transaction(async (tx) => {
      const listing = await tx.produceListing.create({
        data: {
          sellerId,
          categoryId: listingData.categoryId,
          unitId: listingData.unitId,
          pickupAddressSnapshot: listingData.pickupAddressSnapshot as Prisma.InputJsonValue,
          name: listingData.name,
          description: listingData.description ?? null,
          price: listingData.price,
          cancellationWindowHours: listingData.cancellationWindowHours,
          cancellationFeePercentage: listingData.cancellationFeePercentage,
        },
      });

      const inventory = await tx.produceInventory.create({
        data: {
          produceListingId: listing.id,
          totalQuantity,
          availableQuantity: totalQuantity,
          reservedQuantity: 0,
        },
      });

      return {
        listing,
        inventory,
      };
    });
  },
};