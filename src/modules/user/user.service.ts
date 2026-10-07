import { ApiError } from "@/shared/errors";
import { authRepository } from "../auth/auth.repository";
import {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./user.schema";
import { StatusCodes } from "http-status-codes";
import { hashPassword } from "@/shared/utils/hash.util";
import { issueSession, toPublicUser } from "../auth/auth.service";
import { userRepository, type UpdateUserData } from "./user.repository";
import { Prisma } from "../../../generated/prisma";

export function toFindAllParams(q: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    ...(q.role && { role: q.role }),
    ...(q.status && { status: q.status }),
    ...((q.createdFrom || q.createdTo) && {
      createdAt: {
        ...(q.createdFrom && { gte: q.createdFrom }),
        ...(q.createdTo && { lte: q.createdTo }),
      },
    }),
    ...(q.search && {
      OR: [
        { email: { contains: q.search, mode: "insensitive" } },
        { phone: { contains: q.search } },
        { name: { contains: q.search, mode: "insensitive" } },
      ],
    }),
  };

  return {
    where,
    orderBy: { [q.sortBy]: q.order } as Prisma.UserOrderByWithRelationInput,
    take: q.limit,
    skip: (q.page - 1) * q.limit,
  };
}

export const userService = {
  createUser: async (userData: CreateUserInput) => {
    const { username, phone, email, password } = userData;

    const existingUser = await authRepository.findByPhoneOrEmail(phone, email);
    if (existingUser) {
      const field = existingUser.phone === phone ? "Phone number" : "Email";
      throw new ApiError(
        StatusCodes.CONFLICT,
        `${field} is already registered`,
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepository.create({
      name: username,
      phone,
      email,
      passwordHash: hashedPassword,
    });

    const { accessToken, refreshToken } = await issueSession(user);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  listUsers: async (query: ListUsersQuery) => {
    const { users, total } = await userRepository.list(toFindAllParams(query));
    return {
      users,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  getUserById: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  },

  updateUser: async (id: string, userData: UpdateUserInput) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    // Fields are picked out one by one rather than spread. A spread of the
    // request body would carry `role`, `status` or `passwordHash` straight
    // through to Prisma if the route ever lost its validation middleware.
    const { username, phone, email } = userData;

    const data: UpdateUserData = {
      ...(username !== undefined && { name: username }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
    };

    const updatedUser = await userRepository.update(id, data);
    return toPublicUser(updatedUser);
  },

  deleteUser: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    await userRepository.delete(id);
  },

  me: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  }
};