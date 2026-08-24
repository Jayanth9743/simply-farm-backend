import type { Request, Response, NextFunction } from "express";
import { ApiError } from "@/shared/errors";
import { Role } from "../../../generated/prisma";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  };
}