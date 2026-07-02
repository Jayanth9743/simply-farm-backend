import type { NextFunction, Request, Response } from "express";

import { HEADERS } from "../../shared/constants/headers";
import { getRequestId } from "../../shared/utils/request-id";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = getRequestId(req.headers);

  req.requestId = requestId;

  res.setHeader(HEADERS.REQUEST_ID, requestId);

  next();
}