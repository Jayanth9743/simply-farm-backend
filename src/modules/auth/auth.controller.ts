import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "@/shared/responses/api-response";
import type { RegisterInput, LoginInput } from "./auth.schema";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body as RegisterInput);

    return sendResponse(res, {
      statusCode: 201,
      message: "Registered successfully",
      data: result,
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);

    return sendResponse(res, {
      statusCode: 200,
      message: "Logged in successfully",
      data: result,
    });
  },
};