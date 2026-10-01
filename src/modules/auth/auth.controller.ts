import type { Request, Response } from "express";
import { sendResponse } from "@/shared/responses";
import { authService } from "./auth.service";
import type { LoginInput, RegisterInput } from "./auth.schema";
import { StatusCodes } from "http-status-codes";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/shared/utils/cookie.util";
import { ApiError } from "@/shared/errors";

export const authController = {
  async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body as RegisterInput,
    );
    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Registered successfully",
      data: { user, accessToken },
    });
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body as LoginInput,
    );
    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Logged in successfully",
      data: { user, accessToken },
    });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "No refresh token provided");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh(refreshToken);
    setRefreshTokenCookie(res, newRefreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Tokens refreshed successfully",
      data: { accessToken },
    });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "No refresh token provided");
    }

    await authService.logout(refreshToken);
    clearRefreshTokenCookie(res);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Logged out successfully",
    });
  },
};
