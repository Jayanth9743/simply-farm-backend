import type { Request, Response } from "express";
import { sendResponse } from "@/shared/responses";
import { authService } from "./auth.service";
import type { RegisterInput } from "./auth.schema";
import { StatusCodes } from "http-status-codes";
import { setRefreshTokenCookie } from "@/shared/utils/cookie.util";

export const authController = {
  async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.register(req.body as RegisterInput);
    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Registered successfully",
      data: { user, accessToken },
    });
  },
};