import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../shared/errors";

export function notFoundMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  next(new ApiError(StatusCodes.NOT_FOUND, "Route not found"));
}