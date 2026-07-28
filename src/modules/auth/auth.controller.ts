import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "@/shared/responses/api-response";
import type { RegisterInput, LoginInput } from "./auth.schema";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "@/shared/utils/cookie.util";
import { ApiError } from "@/shared/errors/api-error";

export const authController = {
  async register(req: Request, res: Response) {
    const {refreshToken, ...result} = await authService.register(req.body as RegisterInput);

    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: 201,
      message: "Registered successfully",
      data: result,
    });
  },

  async login(req: Request, res: Response) {
    const {refreshToken, ...result} = await authService.login(req.body as LoginInput);

    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: 200,
      message: "Logged in successfully",
      data: result,
    });
  },

  async refresh(req: Request, res: Response) {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  const { refreshToken, ...result } = await authService.refresh(incomingRefreshToken);

  setRefreshTokenCookie(res, refreshToken);

  return sendResponse(res, {
    statusCode: 200,
    message: "Token refreshed successfully",
    data: result,
  });
},

async logout(req: Request, res: Response) {
  await authService.logout(req.user!.sub);

  clearRefreshTokenCookie(res);

  return sendResponse(res, {
    statusCode: 200,
    message: "Logged out successfully",
  });
},

};