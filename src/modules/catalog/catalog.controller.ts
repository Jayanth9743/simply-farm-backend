import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sendResponse } from "@/shared/responses";

import { Role } from "../../../generated/prisma";
import type {
  CreateProduceCategoryInput,
  CreateUnitInput,
  UpdateProduceCategoryInput,
  UpdateUnitInput,
} from "./catalog.schema";
import { produceCategoryService, unitService } from "./catalog.service";

/**
 * Decides whether this caller gets to see retired rows.
 *
 * The list routes are public and sit behind `optionalAuthenticate`, so
 * `req.user` may legitimately be absent. A non-admin asking for
 * `?includeInactive=true` is answered with the plain active list rather than a
 * 403: the flag is a view preference, not a resource, and failing the request
 * would turn an anonymous caller's harmless query string into an error while
 * also confirming that privileged rows exist.
 */
function resolveIncludeInactive(req: Request): boolean {
  if (req.query.includeInactive !== "true") {
    return false;
  }

  return req.user?.role === Role.ADMIN;
}

export const catalogController = {
  listProduceCategories: async (req: Request, res: Response) => {
    const produceCategories = await produceCategoryService.list(
      resolveIncludeInactive(req),
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Produce categories retrieved successfully",
      data: { produceCategories },
    });
  },

  createProduceCategory: async (req: Request, res: Response) => {
    const produceCategory = await produceCategoryService.create(
      req.body as CreateProduceCategoryInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Produce category created successfully",
      data: { produceCategory },
    });
  },

  updateProduceCategory: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const produceCategory = await produceCategoryService.update(
      id,
      req.body as UpdateProduceCategoryInput,
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Produce category updated successfully",
      data: { produceCategory },
    });
  },

  listUnits: async (req: Request, res: Response) => {
    const units = await unitService.list(resolveIncludeInactive(req));

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Units retrieved successfully",
      data: { units },
    });
  },

  createUnit: async (req: Request, res: Response) => {
    const unit = await unitService.create(req.body as CreateUnitInput);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Unit created successfully",
      data: { unit },
    });
  },

  updateUnit: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const unit = await unitService.update(id, req.body as UpdateUnitInput);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Unit updated successfully",
      data: { unit },
    });
  },
};
