import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma";

export const addressRepository = {
  async createAddress(addressData: Prisma.AddressCreateInput) {
    return prisma.address.create({
      data: addressData,
    });
  },

  async findById(id: string) {
    return prisma.address.findUnique({
      where: { id },
    });
  },

  async updateAddress(id: string, addressData: Prisma.AddressUpdateInput) {
    return prisma.address.update({
      where: { id },
      data: addressData,
    });
  },

  async deleteAddress(id: string) {
    return prisma.address.delete({
      where: { id },
    });
  },

  async listAddressesByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
    });
  },

  /**
   * `ProduceListing` and `Equipment` both point at `Address` with no
   * `onDelete`, so Prisma defaults to `Restrict` and deleting a referenced
   * address raises a foreign key error. Counting first lets the caller return a
   * useful 409 instead of surfacing that as a 500.
   */
  async countReferences(addressId: string) {
    const [listings, equipment] = await prisma.$transaction([
      prisma.produceListing.count({
        where: { locationAddressId: addressId },
      }),
      prisma.equipment.count({
        where: { locationAddressId: addressId },
      }),
    ]);

    return { listings, equipment, total: listings + equipment };
  },
};
