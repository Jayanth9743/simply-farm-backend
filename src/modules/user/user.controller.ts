import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError } from "@/shared/errors";
import { sendResponse } from "@/shared/responses";
import { setRefreshTokenCookie } from "@/shared/utils/cookie.util";

import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./user.schema";
import { userService } from "./user.service";

/**
 * `authenticate` already guarantees `req.user`, but the type is optional, so
 * this keeps the invariant in one place and fails with the correct error shape
 * rather than a `sendResponse` body that claims `success: true` on a 401.
 */
function requireUserId(req: Request): string {
  const userId = req.user?.sub;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  return userId;
}

export const userController = {
  createUser: async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await userService.createUser(
      req.body as CreateUserInput,
    );
    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "User created successfully",
      data: { user, accessToken },
    });
  },

  listUsers: async (req: Request, res: Response) => {
    const query = req.query as unknown as ListUsersQuery;
    const { users, meta } = await userService.listUsers(query);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Users retrieved successfully",
      data: { users, meta },
    });
  },

  getUserById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "User retrieved successfully",
      data: { user },
    });
  },

  updateUser: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(
      id,
      req.body as UpdateUserInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  },

  deleteUser: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    await userService.deleteUser(id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
    });
  },

  me: async (req: Request, res: Response) => {
    const user = await userService.me(requireUserId(req));

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "User retrieved successfully",
      data: { user },
    });
  },

  /**
   * Self-service profile update. The id comes from the access token, so a
   * caller cannot target another account, and `updateUserSchema` limits the
   * writable fields to name, phone and email.
   */
  updateMe: async (req: Request, res: Response) => {
    const updatedUser = await userService.updateUser(
      requireUserId(req),
      req.body as UpdateUserInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  },
};
