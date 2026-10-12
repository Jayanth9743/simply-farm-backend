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
};
